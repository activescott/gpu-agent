import { test, expect } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

test.describe("OpenBenchmarking Scraper", () => {
  test("parses GPU benchmark table structure", async ({ page }) => {
    // Load a saved HTML snapshot
    const testDataDir = path.join(__dirname, "../../test-data")
    const htmlPath = path.join(testDataDir, "cs2-4k.html")

    // If the HTML snapshot doesn't exist yet, skip this test
    if (!fs.existsSync(htmlPath)) {
      test.skip()
      return
    }

    const html = fs.readFileSync(htmlPath, "utf-8")
    await page.setContent(html)

    // Wait for table to be present
    await page.waitForSelector(".div_table")

    // Check header structure
    const headers = await page.$$eval(
      ".div_table_first_row .div_table_cell",
      (cells) => cells.map((cell) => cell.textContent?.trim() || ""),
    )

    expect(headers.length).toBeGreaterThan(0)
    expect(headers).toContain("Component")
    expect(headers[headers.length - 1]).toContain("Frames Per Second")
  })

  test("extracts GPU names and FPS values", async ({ page }) => {
    const testDataDir = path.join(__dirname, "../../test-data")
    const htmlPath = path.join(testDataDir, "cs2-4k.html")

    if (!fs.existsSync(htmlPath)) {
      test.skip()
      return
    }

    const html = fs.readFileSync(htmlPath, "utf-8")
    await page.setContent(html)

    await page.waitForSelector(".div_table")

    // Get all rows
    const rows = await page.$$eval(".div_table .div_table_row", (rowElements) => {
      return Array.from(rowElements).map((row) => {
        const cells = Array.from(row.querySelectorAll(".div_table_cell"))
        // Component is typically first column, FPS is last column
        const gpuName = cells[0]?.textContent?.trim() || ""
        const fpsText = cells[cells.length - 1]?.textContent?.trim() || ""
        return { gpuName, fpsText }
      })
    })

    // Should have multiple rows
    expect(rows.length).toBeGreaterThan(10)

    // Spot check specific GPUs we know should be there
    const rtx5090 = rows.find((r) => r.gpuName.includes("RTX 5090"))
    expect(rtx5090).toBeDefined()
    expect(rtx5090?.fpsText).toMatch(/\d+/) // Should have numeric value

    const rtx4090 = rows.find((r) => r.gpuName.includes("RTX 4090"))
    expect(rtx4090).toBeDefined()
    expect(rtx4090?.fpsText).toMatch(/\d+/)
  })

  test("extracts numeric values from FPS text", () => {
    const testCases = [
      { input: "341", expected: 341 },
      { input: "303 +/- 8", expected: 303 },
      { input: "268 ± 11", expected: 268 },
      { input: "N/A", expected: null },
      { input: "< 199", expected: null }, // Less-than values should be null
      { input: "", expected: null },
    ]

    // Simple regex extraction like the scraper uses
    function extractNumericValue(text: string): number | null {
      const match = text.match(/^(\d+(?:\.\d+)?)/)
      return match ? parseFloat(match[1]) : null
    }

    for (const { input, expected } of testCases) {
      const result = extractNumericValue(input)
      expect(result).toBe(expected)
    }
  })

  test("identifies key elements on benchmark page", async ({ page }) => {
    // Navigate to actual page to verify selectors still work
    const url =
      "https://openbenchmarking.org/performance/test/pts/cs2/7f22820f1e1d586f13d970f6604140c3d5037d4d"

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(2000) // Allow dynamic content to load

    // Verify key selectors exist
    const divTable = await page.locator(".div_table").count()
    expect(divTable).toBeGreaterThan(0)

    const headerRow = await page.locator(".div_table_first_row").count()
    expect(headerRow).toBeGreaterThan(0)

    const dataRows = await page.locator(".div_table_row").count()
    expect(dataRows).toBeGreaterThan(10) // Should have many GPU results
  })
})
