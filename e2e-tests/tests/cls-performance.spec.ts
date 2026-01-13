import { test, expect } from "@playwright/test"

// Increase test timeout since page load + CLS measurement takes time
test.setTimeout(60000)

/**
 * Measures Cumulative Layout Shift (CLS) using PerformanceObserver.
 * CLS < 0.1 is considered "good" by Google's Core Web Vitals.
 */
async function measureCLS(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let clsValue = 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const observer = new PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          // Only count shifts without recent user input
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
      })
      observer.observe({ type: "layout-shift", buffered: true })

      // Give time for any late layout shifts
      setTimeout(() => {
        observer.disconnect()
        resolve(clsValue)
      }, 1000)
    })
  })
}

test.describe("Core Web Vitals - CLS", () => {
  test("GPU card page should have CLS below 0.1", async ({ page }) => {
    // Navigate to the example URL from Google Search Console
    await page.goto("/gpu/learn/card/nvidia-geforce-rtx-4090", {
      waitUntil: "domcontentloaded",
    })

    // Wait for the main content to be visible (the GPU name heading)
    await page.waitForSelector("h1", { timeout: 30000 })

    // Wait for React hydration and any delayed renders
    await page.waitForTimeout(3000)

    const cls = await measureCLS(page)
    console.log(`CLS value: ${cls}`)

    // CLS should be below 0.1 (Google's "good" threshold)
    expect(cls).toBeLessThan(0.1)
  })

  test("GPU card page should have CLS below 0.1 on mobile", async ({ page }) => {
    // Set mobile viewport (iPhone SE size - common mobile device)
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to the example URL from Google Search Console
    await page.goto("/gpu/learn/card/nvidia-geforce-rtx-4090", {
      waitUntil: "domcontentloaded",
    })

    // Wait for the main content to be visible (the GPU name heading)
    await page.waitForSelector("h1", { timeout: 30000 })

    // Wait for React hydration and any delayed renders
    await page.waitForTimeout(3000)

    const cls = await measureCLS(page)
    console.log(`CLS value (mobile): ${cls}`)

    // CLS should be below 0.1 (Google's "good" threshold)
    expect(cls).toBeLessThan(0.1)
  })
})
