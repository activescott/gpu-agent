import { test, expect } from '@playwright/test';

test.describe('Gaming Buy Pages', () => {
  test('clicking Gaming Benchmarks category from AI page should not 404', async ({ page }) => {
    // Start on an AI price-compare page - wait for full page load including JS hydration
    await page.goto('/gpu/price-compare/ai/fp32-flops', { waitUntil: 'networkidle' });

    // Wait for page to be fully loaded - cards visible means JS hydration is complete
    const initialCards = page.locator('#listingContainer .card');
    await expect(initialCards.first()).toBeVisible({ timeout: 15000 });

    // Wait for MetricSelector to load
    const metricSelectorLabel = page.getByText('Compare GPUs by metric:');
    await expect(metricSelectorLabel).toBeVisible();

    // Click the "Gaming Benchmarks" category button
    // Use getByRole for better hydration detection - Playwright waits for the element
    // to be actionable (attached, visible, stable, enabled, receives events)
    const gamingBenchmarksButton = page.getByRole('button', { name: 'Gaming Benchmarks' });
    await gamingBenchmarksButton.click();

    // Wait for URL to change and network to settle
    // networkidle waits for no network connections for 500ms, which handles
    // Next.js client-side navigation and any subsequent data fetching
    await page.waitForURL(/\/gpu\/price-compare\/gaming\//, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for the new page content to render (cards visible proves page loaded correctly)
    const gamingCards = page.locator('#listingContainer .card');
    await expect(gamingCards.first()).toBeVisible({ timeout: 15000 });

    // Page should NOT show error (check visible text, not raw HTML which may contain 404 in script paths)
    await expect(page.getByText('Application error')).not.toBeVisible();
    await expect(page.getByText('Unknown slug')).not.toBeVisible();
    await expect(page.getByText('This page could not be found')).not.toBeVisible();
  });

  test('should show gaming metrics (not AI specs) on gaming buy pages', async ({ page }) => {
    // Navigate to a gaming buy page (new canonical URL without cost-per- prefix)
    await page.goto('/gpu/price-compare/gaming/counter-strike-2-fps-3840x2160');

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike.*2|Buy GPUs/i);

    // Find listing cards (specifically within the listing container, not filter sidebar cards)
    const cards = page.locator('#listingContainer .card');
    const cardCount = await cards.count();

    // Should have at least one listing card
    expect(cardCount).toBeGreaterThan(0);

    // Check the first card for correct metric display
    const firstCard = cards.first();

    // Should have exactly one SpecPill (the primary metric)
    const specPills = firstCard.locator('.badge').filter({ hasText: /\$.*\// });
    const pillCount = await specPills.count();
    expect(pillCount).toBe(1); // Only one metric badge per card

    // Get the metric badge text
    const metricText = await specPills.first().textContent();

    // Should show cost per FPS, not infinity
    expect(metricText).not.toContain('$∞');
    expect(metricText).not.toContain('$NaN');
    expect(metricText).toMatch(/\$\s*[\d,]+(\.\d+)?\s*\/\s*FPS/i);

    // Should show raw FPS value with @ symbol
    expect(metricText).toMatch(/@\s*\d+\s*FPS/i);
  });

  test('should not show AI metrics on gaming buy pages', async ({ page }) => {
    // Navigate to a gaming buy page (use resolution-specific URL)
    await page.goto('/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160');

    // Wait for page to load
    await expect(page).toHaveTitle(/3DMark|Buy GPUs/i);

    // Wait for listing cards to be visible (specifically within the listing container)
    const cards = page.locator('#listingContainer .card');
    await expect(cards.first()).toBeVisible();

    // Find all metric badges within listing cards
    const specPills = page.locator('#listingContainer .badge').filter({ hasText: /\$.*\// });
    await expect(specPills.first()).toBeVisible();

    // Get all badge text
    const pillCount = await specPills.count();
    const allBadgeTexts = [];
    for (let i = 0; i < pillCount; i++) {
      const text = await specPills.nth(i).textContent();
      if (text) {
        allBadgeTexts.push(text);
      }
    }

    // Should NOT contain AI metric units (TFLOPs, TOPS, GB/s) in any badge
    for (const badgeText of allBadgeTexts) {
      expect(badgeText).not.toMatch(/\$.*\/\s*TFLOPs/i);
      expect(badgeText).not.toMatch(/\$.*\/\s*TOPS/i);
      expect(badgeText).not.toMatch(/\$.*\/\s*GB\/s/i);

      // SHOULD contain FPS metric
      expect(badgeText).toMatch(/\$.*\/\s*FPS/i);
    }
  });

  test('should show valid numeric values on all gaming buy pages', async ({ page }) => {
    // New canonical URLs (without cost-per- prefix, with resolution)
    const gamingBuyPages = [
      '/gpu/price-compare/gaming/counter-strike-2-fps-3840x2160',
      '/gpu/price-compare/gaming/counter-strike-2-fps-2560x1440',
      '/gpu/price-compare/gaming/counter-strike-2-fps-1920x1080',
      '/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160',
    ];

    for (const pagePath of gamingBuyPages) {
      await page.goto(pagePath);

      // Find listing cards (specifically within the listing container, not filter sidebar cards)
      const cards = page.locator('#listingContainer .card');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        // Check first card has valid numeric values
        const firstCard = cards.first();
        const specPill = firstCard.locator('.badge').filter({ hasText: /\$.*\// }).first();

        await expect(specPill).toBeVisible();

        const metricText = await specPill.textContent();

        // Should not contain infinity or NaN
        expect(metricText).not.toContain('$∞');
        expect(metricText).not.toContain('$NaN');
        expect(metricText).not.toMatch(/\$\s*(Infinity|NaN)/i);

        // Should contain a valid dollar amount
        expect(metricText).toMatch(/\$\s*[\d,]+(\.\d+)?/);
      }
    }
  });

  test('should show correct metric for each gaming buy page', async ({ page }) => {
    const testCases = [
      {
        path: '/gpu/price-compare/gaming/counter-strike-2-fps-3840x2160',
        expectedMetric: 'FPS',
        title: /Counter.*Strike.*2.*4K|3840x2160/i,
      },
      {
        path: '/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160',
        expectedMetric: 'FPS',
        title: /3DMark.*Wild.*Life/i,
      },
    ];

    for (const testCase of testCases) {
      await page.goto(testCase.path);

      // Verify title
      await expect(page).toHaveTitle(testCase.title);

      // Find listing cards (specifically within the listing container, not filter sidebar cards)
      const cards = page.locator('#listingContainer .card');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        const firstCard = cards.first();
        const specPill = firstCard.locator('.badge').filter({ hasText: /\$.*\// }).first();

        const metricText = await specPill.textContent();

        // Verify it shows the expected metric unit
        expect(metricText).toContain(testCase.expectedMetric);
      }
    }
  });

  test('should redirect old cost-per-* gaming URLs to new slugs', async ({ page }) => {
    // Test that old URLs redirect to new canonical URLs
    const redirectTests = [
      {
        oldPath: '/gpu/price-compare/gaming/cost-per-counter-strike-2-fps-3840x2160',
        expectedPath: '/gpu/price-compare/gaming/counter-strike-2-fps-3840x2160',
      },
      {
        // Note: old URL without resolution redirects to URL with resolution
        oldPath: '/gpu/price-compare/gaming/cost-per-3dmark-wildlife-extreme-fps',
        expectedPath: '/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160',
      },
    ];

    for (const testCase of redirectTests) {
      await page.goto(testCase.oldPath);

      // Should have been redirected to new URL
      const currentUrl = page.url();
      expect(currentUrl).toContain(testCase.expectedPath);

      // Page should load without error
      const pageContent = await page.content();
      expect(pageContent).not.toContain('Unknown slug');
      expect(pageContent).not.toContain('Application error');
    }
  });
});
