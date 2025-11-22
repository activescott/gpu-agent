import { chromium } from "playwright"

async function debugPage() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const url =
    "https://openbenchmarking.org/performance/test/pts/cs2/7f22820f1e1d586f13d970f6604140c3d5037d4d"
  console.log(`Navigating to ${url}...`)

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })

  // Wait a bit for any dynamic content
  await page.waitForTimeout(3000)

  // Check for various possible selectors
  const selectors = [
    "#div_table",
    ".div_table",
    "table",
    "[class*='table']",
    "[id*='table']",
    "[class*='result']",
    "[id*='result']",
  ]

  for (const selector of selectors) {
    const exists = await page.locator(selector).count()
    console.log(`${selector}: ${exists} elements found`)
  }

  // Get all IDs on the page
  const ids = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("[id]"))
      .map((el) => el.id)
      .filter((id) => id.toLowerCase().includes("table") || id.toLowerCase().includes("result"))
  })
  console.log("IDs containing 'table' or 'result':", ids)

  // Get all classes
  const classes = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("[class]"))
      .flatMap((el) => Array.from(el.classList))
      .filter(
        (cls) =>
          cls.toLowerCase().includes("table") || cls.toLowerCase().includes("result"),
      )
      .filter((v, i, a) => a.indexOf(v) === i) // unique
  })
  console.log("Classes containing 'table' or 'result':", classes)

  // Take a screenshot
  await page.screenshot({ path: "/tmp/openbench-debug.png", fullPage: true })
  console.log("Screenshot saved to /tmp/openbench-debug.png")

  await browser.close()
}

debugPage().catch(console.error)
