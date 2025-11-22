import { chromium, Browser, Page } from "@playwright/test"
import {
  BenchmarkData,
  BenchmarkResult,
  BenchmarkScraperConfig,
} from "../types"
import * as fs from "fs/promises"
import * as path from "path"
import yaml from "yaml"

const FIVE_SECONDS = 5000
const TEN_SECONDS = 10000
const THIRTY_SECONDS = 30000

/**
 * Extract numeric value from text like "554 +/- 4" -> 554
 */
function extractNumericValue(text: string): number | null {
  const match = text.match(/^(\d+(?:\.\d+)?)/)
  return match ? Number.parseFloat(match[1]) : null
}

/**
 * Scrape a single benchmark configuration from OpenBenchmarking
 */
async function scrapeBenchmarkConfiguration(
  page: Page,
  config: BenchmarkScraperConfig,
  configurationId: string,
  configurationName: string,
): Promise<BenchmarkData> {
  // Navigate to the performance test page for this configuration
  const url = `https://openbenchmarking.org/performance/test/pts/${config.benchmarkId}/${configurationId}`
  console.log(`Scraping ${url}...`)

  await page.goto(url, { waitUntil: "networkidle", timeout: THIRTY_SECONDS })

  // Wait a moment for dynamic content to render
  await page.waitForTimeout(2000)

  // Wait for the table to load
  await page.waitForSelector(".div_table", { timeout: THIRTY_SECONDS })

  // Get column headers
  const headerCells = await page.$$eval(
    ".div_table_first_row .div_table_cell",
    (cells) => cells.map((cell) => cell.textContent?.trim() || ""),
  )

  if (headerCells.length === 0) {
    throw new Error("No column headers found")
  }

  // Find indices for relevant columns
  const componentColumnIndex = headerCells.findIndex((header) =>
    header.includes("Component"),
  )
  const lastColumnIndex = headerCells.length - 1

  if (componentColumnIndex === -1) {
    throw new Error("Could not find Component column")
  }

  const metricName = headerCells[lastColumnIndex] || "Unknown Metric"
  console.log(`Found metric: ${metricName}`)

  // Extract results from each row
  const rows = await page.$$eval(
    ".div_table .div_table_row",
    (rowElements, indices) => {
      return Array.from(rowElements).map((row) => {
        const cells = Array.from(row.querySelectorAll(".div_table_cell"))
        const componentCell = cells[indices.componentIdx]
        const valueCell = cells[indices.valueIdx]

        const gpuName =
          componentCell?.textContent?.trim() || "Unknown GPU"
        const valueText = valueCell?.textContent?.trim() || ""

        return { gpuName, valueText }
      })
    },
    { componentIdx: componentColumnIndex, valueIdx: lastColumnIndex },
  )

  // Process results
  const results: BenchmarkResult[] = []

  for (const row of rows) {
    const value = extractNumericValue(row.valueText)
    if (value === null) {
      console.warn(`Could not extract numeric value from: ${row.valueText}`)
      continue
    }

    results.push({
      gpuNameRaw: row.gpuName,
      value,
    })
  }

  console.log(`Found ${results.length} results`)

  return {
    benchmarkId: config.benchmarkId,
    benchmarkName: config.benchmarkName,
    configuration: configurationName,
    configurationId,
    metricName,
    results,
    scrapedAt: new Date().toISOString(),
  }
}

/**
 * Get available configurations for a benchmark
 */
async function getBenchmarkConfigurations(
  page: Page,
  config: BenchmarkScraperConfig,
): Promise<Array<{ name: string; id: string }>> {
  const url = `https://openbenchmarking.org/test/pts/${config.benchmarkId}`
  console.log(`Fetching configurations from ${url}...`)

  await page.goto(url, { waitUntil: "networkidle", timeout: TEN_SECONDS })

  // Check if the performance evaluation dropdown exists
  const dropdownSelector = 'select[name="show_perf_dropdown"]'
  const dropdown = await page.$(dropdownSelector)

  if (!dropdown) {
    console.log("No configuration dropdown found, using default configuration")
    return []
  }

  // Extract configurations from dropdown
  const configurations = await page.$$eval(
    `${dropdownSelector} option`,
    (options) =>
      options.map((option) => ({
        name: option.textContent?.trim() || "",
        id: option.value,
      })),
  )

  console.log(`Found ${configurations.length} configurations`)
  return configurations
}

/**
 * Scrape a benchmark from OpenBenchmarking
 */
export async function scrapeBenchmark(
  config: BenchmarkScraperConfig,
  outputDir: string,
): Promise<void> {
  console.log(`\nScraping benchmark: ${config.benchmarkName}`)
  console.log(`Output directory: ${outputDir}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  })
  const page = await context.newPage()

  try {
    // Get configurations if not provided
    let configurations = config.configurations || []
    if (configurations.length === 0) {
      configurations = await getBenchmarkConfigurations(page, config)
    }

    // If still no configurations, scrape the default page
    if (configurations.length === 0) {
      console.log("No configurations found, scraping default page")
      const data = await scrapeBenchmarkConfiguration(
        page,
        config,
        "",
        "Default",
      )

      // Save to file
      const fileName = `${config.benchmarkId}.yaml`
      const filePath = path.join(outputDir, fileName)
      await fs.writeFile(filePath, yaml.stringify(data), "utf-8")
      console.log(`Saved to ${filePath}`)
    } else {
      // Scrape each configuration
      for (const cfg of configurations) {
        try {
          const data = await scrapeBenchmarkConfiguration(
            page,
            config,
            cfg.id,
            cfg.name,
          )

          // Create a filename from benchmark ID and configuration
          const configSlug = cfg.name
            .toLowerCase()
            .replaceAll(/[^a-z\d]+/g, "-")
            .replaceAll(/^-+|-+$/g, "")
          const fileName = `${config.benchmarkId}-${configSlug}.yaml`
          const filePath = path.join(outputDir, fileName)

          await fs.writeFile(filePath, yaml.stringify(data), "utf-8")
          console.log(`Saved to ${filePath}`)

          // Be polite to the server
          await page.waitForTimeout(FIVE_SECONDS)
        } catch (error) {
          console.error(`Error scraping configuration ${cfg.name}:`, error)
        }
      }
    }
  } finally {
    await browser.close()
  }
}

/**
 * Predefined benchmark configurations
 */
export const BENCHMARK_CONFIGS: Record<string, BenchmarkScraperConfig> = {
  cs2: {
    benchmarkId: "cs2",
    benchmarkName: "Counter-Strike 2",
    url: "https://openbenchmarking.org/test/pts/cs2",
  },
  "3dmark": {
    benchmarkId: "3dmark",
    benchmarkName: "3DMark Wild Life Extreme",
    url: "https://openbenchmarking.org/test/pts/3dmark",
  },
}
