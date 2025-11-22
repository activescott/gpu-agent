import { test, expect } from '@playwright/test';

test.describe('Gaming Buy Pages', () => {
  test('should show gaming metrics (not AI specs) on gaming buy pages', async ({ page }) => {
    // Navigate to a gaming buy page
    await page.goto('/gpu/buy/gaming/cost-per-counter-strike-2-fps-3840x2160');

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike.*2|Buy GPUs/i);

    // Find listing cards
    const cards = page.locator('.card');
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

    // Should show raw FPS value in parentheses
    expect(metricText).toMatch(/\(\s*\d+\s*fps\s*\)/i);
  });

  test('should not show AI metrics on gaming buy pages', async ({ page }) => {
    // Navigate to a gaming buy page
    await page.goto('/gpu/buy/gaming/cost-per-3dmark-wildlife-extreme-fps');

    // Wait for page to load
    await expect(page).toHaveTitle(/3DMark|Buy GPUs/i);

    // Wait for listing cards to be visible
    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible();

    // Find all metric badges
    const specPills = page.locator('.badge').filter({ hasText: /\$.*\// });
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
    const gamingBuyPages = [
      '/gpu/buy/gaming/cost-per-counter-strike-2-fps-3840x2160',
      '/gpu/buy/gaming/cost-per-counter-strike-2-fps-2560x1440',
      '/gpu/buy/gaming/cost-per-counter-strike-2-fps-1920x1080',
      '/gpu/buy/gaming/cost-per-3dmark-wildlife-extreme-fps',
    ];

    for (const pagePath of gamingBuyPages) {
      await page.goto(pagePath);

      // Find listing cards
      const cards = page.locator('.card');
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
        path: '/gpu/buy/gaming/cost-per-counter-strike-2-fps-3840x2160',
        expectedMetric: 'FPS',
        title: /Counter.*Strike.*2.*4K|3840x2160/i,
      },
      {
        path: '/gpu/buy/gaming/cost-per-3dmark-wildlife-extreme-fps',
        expectedMetric: 'FPS',
        title: /3DMark.*Wild.*Life/i,
      },
    ];

    for (const testCase of testCases) {
      await page.goto(testCase.path);

      // Verify title
      await expect(page).toHaveTitle(testCase.title);

      // Find listing cards
      const cards = page.locator('.card');
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
});
