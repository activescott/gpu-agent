import { test, expect } from '@playwright/test';

/**
 * Tests that all Popular GPU Comparison links on the homepage return 200 status.
 * These links are prominently displayed and broken links hurt user experience and SEO.
 */
test.describe('Popular GPU Comparisons', () => {
  test('all comparison links on homepage should return 200', async ({ page }) => {
    // Go to homepage
    await page.goto('/');

    // Find all links within the Popular GPU Comparisons section
    const comparisonLinks = page.locator('a[href^="/gpu/compare/"]');
    const linkCount = await comparisonLinks.count();

    // Should have at least some comparison links
    expect(linkCount).toBeGreaterThan(0);

    // Collect all URLs
    const urls: string[] = [];
    for (let i = 0; i < linkCount; i++) {
      const href = await comparisonLinks.nth(i).getAttribute('href');
      if (href) {
        urls.push(href);
      }
    }

    // Verify each URL returns 200
    for (const url of urls) {
      const response = await page.goto(url);
      expect(response?.status(), `Expected ${url} to return 200`).toBe(200);

      // Also verify the page has a proper heading (not a 404 page)
      const heading = page.locator('h1').first();
      await expect(heading).toContainText(/vs/);
    }
  });

  test('comparison links on /gpu/compare landing page should return 200', async ({ page }) => {
    // Go to compare landing page
    await page.goto('/gpu/compare');

    // Find all comparison links (excluding the main page link itself)
    const comparisonLinks = page.locator('a[href^="/gpu/compare/"][href*="/vs/"]');
    const linkCount = await comparisonLinks.count();

    // Should have at least some comparison links
    expect(linkCount).toBeGreaterThan(0);

    // Collect all URLs
    const urls: string[] = [];
    for (let i = 0; i < linkCount; i++) {
      const href = await comparisonLinks.nth(i).getAttribute('href');
      if (href) {
        urls.push(href);
      }
    }

    // Verify each URL returns 200
    for (const url of urls) {
      const response = await page.goto(url);
      expect(response?.status(), `Expected ${url} to return 200`).toBe(200);
    }
  });
});
