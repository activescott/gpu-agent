import { test, expect } from '@playwright/test';

test.describe('AI Buy Pages', () => {
  test('should load AI price-compare pages with new slugs', async ({ page }) => {
    // These are the new canonical slugs for AI price-compare pages (matching DB slugs)
    const aiBuyPages = [
      {
        path: '/gpu/price-compare/ai/fp32-flops',
        titlePattern: /FP32|TFLOPs|Compare GPU/i,
      },
      {
        path: '/gpu/price-compare/ai/fp16-flops',
        titlePattern: /FP16|TFLOPs|Compare GPU/i,
      },
      {
        path: '/gpu/price-compare/ai/tensor-cores',
        titlePattern: /Tensor|Core|Compare GPU/i,
      },
      {
        path: '/gpu/price-compare/ai/memory-gb',
        titlePattern: /Memory|GB|Compare GPU/i,
      },
      {
        path: '/gpu/price-compare/ai/memory-bandwidth-gbs',
        titlePattern: /Memory|Bandwidth|GB\/s|Compare GPU/i,
      },
      {
        path: '/gpu/price-compare/ai/int8-tops',
        titlePattern: /INT8|TOPS|Compare GPU/i,
      },
    ];

    for (const testCase of aiBuyPages) {
      await page.goto(testCase.path);

      // Page should not show error
      const pageContent = await page.content();
      expect(pageContent).not.toContain('Unknown slug');
      expect(pageContent).not.toContain('Application error');

      // Should have a valid title
      await expect(page).toHaveTitle(testCase.titlePattern);
    }
  });

  test('should redirect old cost-per-* URLs to new slugs', async ({ page }) => {
    // Test that old URLs redirect to new canonical URLs
    const redirectTests = [
      {
        oldPath: '/gpu/price-compare/ai/cost-per-fp32-flops',
        expectedPath: '/gpu/price-compare/ai/fp32-flops',
      },
      {
        oldPath: '/gpu/price-compare/ai/cost-per-tensor-core',
        expectedPath: '/gpu/price-compare/ai/tensor-cores',
      },
      {
        oldPath: '/gpu/price-compare/gaming/cost-per-counter-strike-2-fps-3840x2160',
        expectedPath: '/gpu/price-compare/gaming/counter-strike-2-fps-3840x2160',
      },
      // Alternative slug variants (tflops -> flops)
      {
        oldPath: '/gpu/price-compare/ai/fp32-tflops',
        expectedPath: '/gpu/price-compare/ai/fp32-flops',
      },
      {
        oldPath: '/gpu/price-compare/ai/fp16-tflops',
        expectedPath: '/gpu/price-compare/ai/fp16-flops',
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

  test('should show AI metrics (not gaming) on AI buy pages', async ({ page }) => {
    await page.goto('/gpu/price-compare/ai/fp32-flops');

    // Wait for page to load
    await expect(page).toHaveTitle(/FP32|TFLOPs|Compare GPU/i);

    // Find listing cards (specifically within the listing container, not filter sidebar cards)
    const cards = page.locator('#listingContainer .card');
    const cardCount = await cards.count();

    // Should have at least one listing card
    expect(cardCount).toBeGreaterThan(0);

    // Check the first card for correct metric display
    const firstCard = cards.first();

    // Should have a metric badge
    const specPills = firstCard.locator('.badge').filter({ hasText: /\$.*\// });
    const pillCount = await specPills.count();
    expect(pillCount).toBe(1);

    // Get the metric badge text
    const metricText = await specPills.first().textContent();

    // Should show cost per TFLOPS, not infinity or NaN
    expect(metricText).not.toContain('$∞');
    expect(metricText).not.toContain('$NaN');
    // Match either "/ TFLOPs" or "/ FP32 TFLOPs"
    expect(metricText).toMatch(/\/\s*(FP32\s*)?TFLOPs/i);
  });

  test('should show valid numeric values on all AI buy pages', async ({ page }) => {
    const aiBuyPages = [
      '/gpu/price-compare/ai/fp32-flops',
      '/gpu/price-compare/ai/fp16-flops',
      '/gpu/price-compare/ai/tensor-cores',
      '/gpu/price-compare/ai/memory-gb',
    ];

    for (const pagePath of aiBuyPages) {
      await page.goto(pagePath);

      // Page should not error
      const content = await page.content();
      expect(content).not.toContain('Unknown slug');

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

  test('MetricSelector should generate correct price-compare URLs', async ({ page }) => {
    // Start on a valid AI buy page
    await page.goto('/gpu/price-compare/ai/fp32-flops');

    // Wait for MetricSelector to load
    const metricSelectorLabel = page.getByText('Compare GPUs by metric:');
    await expect(metricSelectorLabel).toBeVisible();

    // Find metric links in the selector
    const metricLinks = page.locator('.nav-underline .nav-link[href*="/gpu/price-compare/"]');
    const linkCount = await metricLinks.count();

    // Should have some metric links
    expect(linkCount).toBeGreaterThan(0);

    // Check that all links use the new slug format (no cost-per- prefix)
    for (let i = 0; i < linkCount; i++) {
      const href = await metricLinks.nth(i).getAttribute('href');
      if (href) {
        // Should NOT have cost-per- prefix in the new canonical URLs
        expect(href).not.toContain('cost-per-');
        // Should have the correct base path
        expect(href).toMatch(/\/gpu\/price-compare\/(ai|gaming)\//);
      }
    }
  });

  test('MetricSelector should not have duplicate metric items', async ({ page }) => {
    // Navigate to an AI price-compare page
    await page.goto('/gpu/price-compare/ai/fp32-flops');

    // Wait for MetricSelector to load
    const metricSelectorLabel = page.getByText('Compare GPUs by metric:');
    await expect(metricSelectorLabel).toBeVisible();

    // Find all AI metric links in the nav
    const aiMetricLinks = page.locator('.nav-underline .nav-link[href*="/gpu/price-compare/ai/"]');
    const linkCount = await aiMetricLinks.count();

    // Collect all link texts and hrefs
    const linkTexts: string[] = [];
    const linkHrefs: string[] = [];
    for (let i = 0; i < linkCount; i++) {
      const text = await aiMetricLinks.nth(i).textContent();
      const href = await aiMetricLinks.nth(i).getAttribute('href');
      if (text) linkTexts.push(text.trim());
      if (href) linkHrefs.push(href);
    }

    // Check for duplicate link texts (e.g., two "FP32 TFLOPs" items)
    const uniqueTexts = new Set(linkTexts);
    expect(
      uniqueTexts.size,
      `Found duplicate metric names in nav: ${linkTexts.join(', ')}`
    ).toBe(linkTexts.length);

    // Check for duplicate hrefs (shouldn't have same link twice)
    const uniqueHrefs = new Set(linkHrefs);
    expect(
      uniqueHrefs.size,
      `Found duplicate metric hrefs in nav: ${linkHrefs.join(', ')}`
    ).toBe(linkHrefs.length);

    // Should have exactly 6 AI metrics (no duplicates from legacy slugs)
    // FP32 FLOPS, FP16 FLOPS, INT8 TOPS, Tensor Cores, Memory GB, Memory Bandwidth
    expect(linkCount).toBe(6);
  });
});
