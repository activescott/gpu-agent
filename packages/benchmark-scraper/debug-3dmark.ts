import { chromium } from "playwright"

async function debug3DMark() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const url =
    "https://openbenchmarking.org/performance/test/pts/3dmark/251684d1fa3c186574f1dd35f0bee61979b0c293"
  console.log(`Navigating to ${url}...`)

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  console.log("Page loaded")

  // Wait progressively longer for the table
  for (let i = 1; i <= 10; i++) {
    await page.waitForTimeout(1000)
    const tableCount = await page.locator(".div_table").count()
    console.log(`After ${i}s: .div_table elements = ${tableCount}`)

    if (tableCount > 0) {
      console.log("Table found!")

      // Check if it has data
      const rowCount = await page.locator(".div_table_row").count()
      console.log(`Rows found: ${rowCount}`)

      if (rowCount > 0) {
        // Get first few GPUs
        const rows = await page.$$eval(
          ".div_table .div_table_row",
          (rowElements) => {
            return Array.from(rowElements).slice(0, 5).map((row) => {
              const cells = Array.from(row.querySelectorAll(".div_table_cell"))
              const gpuName = cells[0]?.textContent?.trim() || ""
              const fpsText = cells[cells.length - 1]?.textContent?.trim() || ""
              return { gpuName, fpsText }
            })
          },
        )
        console.log("Sample data:", rows)
      }

      break
    }
  }

  await browser.close()
}

debug3DMark().catch(console.error)
