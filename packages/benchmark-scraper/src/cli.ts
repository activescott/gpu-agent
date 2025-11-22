#!/usr/bin/env node
import * as path from "path"
import * as fs from "fs/promises"
import { scrapeBenchmark, BENCHMARK_CONFIGS } from "./scrapers/openbenchmarking"

async function main() {
  const args = process.argv.slice(2)
  const benchmarkArg = args.find((arg) => arg.startsWith("--benchmark="))
  const benchmarkName = benchmarkArg?.split("=")[1]

  // Default output directory: ../../data/benchmark-data
  const outputDir = path.join(__dirname, "../../../data/benchmark-data")

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true })

  if (benchmarkName && BENCHMARK_CONFIGS[benchmarkName]) {
    // Scrape single benchmark
    console.log(`Scraping benchmark: ${benchmarkName}`)
    await scrapeBenchmark(BENCHMARK_CONFIGS[benchmarkName], outputDir)
  } else if (benchmarkName) {
    console.error(`Unknown benchmark: ${benchmarkName}`)
    console.error(
      `Available benchmarks: ${Object.keys(BENCHMARK_CONFIGS).join(", ")}`,
    )
    process.exit(1)
  } else {
    // Scrape all benchmarks
    console.log("Scraping all benchmarks...")
    for (const [name, config] of Object.entries(BENCHMARK_CONFIGS)) {
      try {
        await scrapeBenchmark(config, outputDir)
      } catch (error) {
        console.error(`Error scraping ${name}:`, error)
      }
    }
  }

  console.log("\nDone!")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
