import { test, expect } from "@playwright/test"

const SAMPLE_GPU = "nvidia-geforce-rtx-4090"
// Use a date that should always be valid (Jan 2026 is the earliest valid month)
const VALID_MONTH_SLUG = "january-2026"
const VALID_MONTH_DISPLAY = "January 2026"

test.describe("GPU Price By Month Page", () => {
  test("renders page with correct title, H1, and canonical URL", async ({
    page,
  }) => {
    const response = await page.goto(
      `/gpu/learn/price/${VALID_MONTH_SLUG}/${SAMPLE_GPU}`,
    )
    expect(response?.status()).toBe(200)

    // Title should target the search query pattern
    await expect(page).toHaveTitle(
      new RegExp(`RTX 4090 Price in ${VALID_MONTH_DISPLAY}.*GPU Poet`, "i"),
    )

    // H1 should contain GPU label + month
    const h1 = page.locator("h1").first()
    await expect(h1).toContainText(VALID_MONTH_DISPLAY)
    await expect(h1).toContainText(/RTX 4090/i)

    // Canonical URL should point at the price page
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href")
    expect(canonical).toContain(
      `/gpu/learn/price/${VALID_MONTH_SLUG}/${SAMPLE_GPU}`,
    )
  })

  test("includes link to the card page for full specs", async ({ page }) => {
    await page.goto(`/gpu/learn/price/${VALID_MONTH_SLUG}/${SAMPLE_GPU}`)

    const cardLink = page.locator(`a[href="/gpu/learn/card/${SAMPLE_GPU}"]`)
    await expect(cardLink).toBeVisible()
  })

  test("includes buyer-focused CTA linking to shop page", async ({ page }) => {
    await page.goto(`/gpu/learn/price/${VALID_MONTH_SLUG}/${SAMPLE_GPU}`)

    const shopLink = page.locator(`a[href="/gpu/shop/${SAMPLE_GPU}"]`)
    // The Buy section CTA button should link to the shop page with buy-focused text
    const cta = shopLink.filter({ hasText: /deals/i }).first()
    await expect(cta).toBeVisible()
    // Must not use internal jargon
    await expect(cta).not.toContainText(/current listings/i)
  })

  test("uses 'lowest average' terminology consistently, not raw average", async ({
    page,
  }) => {
    await page.goto(`/gpu/learn/price/${VALID_MONTH_SLUG}/${SAMPLE_GPU}`)

    const insights = page.getByRole("heading", {
      name: /Price Insights for/i,
    }).locator("..")
    await expect(insights).toBeVisible()

    const bodyText = await page.locator("main, body").first().textContent()
    // Insights section must reference the site-wide metric name
    expect(bodyText).toMatch(/lowest average price/i)
    // Must NOT use "average listed price" phrasing that implies mean-of-all
    expect(bodyText).not.toMatch(/average listed price/i)
  })

  test("renders price history chart", async ({ page }) => {
    await page.goto(`/gpu/learn/price/${VALID_MONTH_SLUG}/${SAMPLE_GPU}`)

    // The chart heading should include the target month
    await expect(
      page.getByRole("heading", {
        name: new RegExp(`Price History.*${VALID_MONTH_DISPLAY}`, "i"),
      }),
    ).toBeVisible()

    // A canvas element (Chart.js) should be rendered
    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 15000 })
  })

  test("includes JSON-LD Product structured data", async ({ page }) => {
    await page.goto(`/gpu/learn/price/${VALID_MONTH_SLUG}/${SAMPLE_GPU}`)

    const jsonLdScript = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent()
    expect(jsonLdScript).toBeTruthy()
    const structured = JSON.parse(jsonLdScript!)
    expect(structured["@type"]).toBe("Product")
    expect(structured.name).toContain("RTX 4090")
  })

  test("includes credibility section about price tracking", async ({
    page,
  }) => {
    await page.goto(`/gpu/learn/price/${VALID_MONTH_SLUG}/${SAMPLE_GPU}`)

    await expect(
      page.getByRole("heading", { name: /How GPU Poet Tracks Prices/i }),
    ).toBeVisible()
  })

  test("returns 404 for pre-2026 year-months", async ({ page }) => {
    const response = await page.goto(
      `/gpu/learn/price/december-2025/${SAMPLE_GPU}`,
    )
    expect(response?.status()).toBe(404)
  })

  test("404 page offers GPU-specific CTAs back to current price + shop", async ({
    page,
  }) => {
    await page.goto(`/gpu/learn/price/december-2025/${SAMPLE_GPU}`)

    // Primary CTA: current month's price page for the same GPU
    const currentMonthLink = page
      .locator("a")
      .filter({ hasText: /price for/i })
      .first()
    await expect(currentMonthLink).toBeVisible()
    const currentMonthHref = await currentMonthLink.getAttribute("href")
    expect(currentMonthHref).toMatch(
      new RegExp(`^/gpu/learn/price/[a-z]+-\\d{4}/${SAMPLE_GPU}$`),
    )
    // Must not link back to the invalid 404 URL
    expect(currentMonthHref).not.toContain("december-2025")

    // Secondary CTA: shop page for the same GPU
    const shopLink = page.locator(`a[href="/gpu/shop/${SAMPLE_GPU}"]`)
    await expect(shopLink).toBeVisible()
  })

  test("returns 404 for far-future year-months", async ({ page }) => {
    const response = await page.goto(
      `/gpu/learn/price/january-2099/${SAMPLE_GPU}`,
    )
    expect(response?.status()).toBe(404)
  })

  test("returns 404 for invalid year-month slug", async ({ page }) => {
    const response = await page.goto(
      `/gpu/learn/price/not-a-month/${SAMPLE_GPU}`,
    )
    expect(response?.status()).toBe(404)
  })

  test("returns 404 for unknown GPU slug", async ({ page }) => {
    const response = await page.goto(
      `/gpu/learn/price/${VALID_MONTH_SLUG}/this-gpu-does-not-exist-12345`,
    )
    expect(response?.status()).toBe(404)
  })

  test("sitemap includes price-by-month entries", async ({ page }) => {
    const response = await page.goto("/sitemap.xml")
    expect(response?.status()).toBe(200)
    const content = (await response?.text()) || ""
    // Should include at least one /gpu/learn/price/ URL
    expect(content).toMatch(
      /<loc>https:\/\/gpupoet\.com\/gpu\/learn\/price\/[^<]+<\/loc>/,
    )
  })
})
