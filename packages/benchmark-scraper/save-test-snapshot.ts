import { chromium } from "playwright"
import * as fs from "fs"
import * as path from "path"

async function saveSnapshot() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const url =
    "https://openbenchmarking.org/performance/test/pts/cs2/7f22820f1e1d586f13d970f6604140c3d5037d4d"
  console.log(`Navigating to ${url}...`)

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
  await page.waitForTimeout(3000) // Wait for dynamic content

  // Get the full HTML
  const html = await page.content()

  // Save to test-data directory
  const testDataDir = path.join(__dirname, "../test-data")
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true })
  }

  const outputPath = path.join(testDataDir, "cs2-4k.html")
  fs.writeFileSync(outputPath, html, "utf-8")

  console.log(`Saved HTML snapshot to ${outputPath}`)
  console.log(`File size: ${(html.length / 1024).toFixed(1)} KB`)

  await browser.close()
}

saveSnapshot().catch(console.error)
