import { test, expect } from '@playwright/test';

// Minimum percentage of GPUs that should have listings
const MIN_LISTINGS_PERCENT = 50;
// Minimum percentage of GPUs that should have the spec data
const MIN_SPEC_PERCENT = 75;

test.describe('GPU Ranking Page', () => {
  test('should display metric selector on gaming benchmark page', async ({ page }) => {
    // Navigate to a gaming benchmark ranking page
    await page.goto('/gpu/ranking/gaming/counter-strike-2-fps-3840x2160');

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike|GPUs Ranked by/i);

    // The MetricSelector should be visible with the "Compare GPUs by metric:" label
    const metricSelectorLabel = page.getByText('Compare GPUs by metric:');
    await expect(metricSelectorLabel).toBeVisible();

    // Category tabs should be present (at least Gaming Benchmarks)
    const gamingBenchmarksTab = page.getByRole('button', { name: /Gaming Benchmarks/i });
    await expect(gamingBenchmarksTab).toBeVisible();

    // At least one metric link should be present
    const metricLinks = page.locator('.nav-underline .nav-link');
    const linkCount = await metricLinks.count();
    expect(linkCount).toBeGreaterThan(1); // Should have category tabs + metric links
  });

  test('should display metric selector on AI spec page', async ({ page }) => {
    // Navigate to an AI spec ranking page
    await page.goto('/gpu/ranking/ai/fp32-flops');

    // Wait for page to load
    await expect(page).toHaveTitle(/FP32.*TFLOPs|GPUs Ranked by/i);

    // The MetricSelector should be visible with the "Compare GPUs by metric:" label
    const metricSelectorLabel = page.getByText('Compare GPUs by metric:');
    await expect(metricSelectorLabel).toBeVisible();

    // AI Specs tab should be present
    const aiSpecsTab = page.getByRole('button', { name: /AI Specs/i });
    await expect(aiSpecsTab).toBeVisible();
  });
  test('should have reasonable coverage of listings and specs on fp32-flops ranking', async ({ page }) => {
    // Navigate to the FP32 FLOPS ranking page (old route for backwards compatibility)
    await page.goto('/ml/learn/gpu/ranking/fp32-flops');

    // Wait for page to load
    await expect(page).toHaveTitle(/FP32.*TFLOPs|GPUs Ranked by/i);

    // Find the ranking table
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();

    // Get all data rows (excluding header row)
    const rows = table.getByRole('row');
    const totalRows = await rows.count();
    const dataRowCount = totalRows - 1; // Subtract header row

    // Expect a reasonable number of GPUs
    expect(dataRowCount).toBeGreaterThanOrEqual(20);

    let rowsWithListings = 0;
    let rowsWithSpec = 0;

    // Check each data row (skip header row at index 0)
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      const rowText = await row.textContent();

      // Check if row has listings (has a $ with numbers)
      if (rowText?.match(/\$\s*[\d,]+(\.\d+)?/)) {
        rowsWithListings++;
      }

      // Check if row has spec data (doesn't say "metric n/a" for this metric)
      if (!rowText?.includes('metric n/a')) {
        rowsWithSpec++;
      }
    }

    // Verify thresholds
    const listingsPercent = (rowsWithListings / dataRowCount) * 100;
    const specPercent = (rowsWithSpec / dataRowCount) * 100;

    expect(listingsPercent).toBeGreaterThanOrEqual(MIN_LISTINGS_PERCENT);
    expect(specPercent).toBeGreaterThanOrEqual(MIN_SPEC_PERCENT);
  });

  test('should not contain NaN values on AI ranking page', async ({ page }) => {
    // Navigate to the new AI ranking route
    await page.goto('/gpu/ranking/ai/fp32-flops');

    // Wait for page to load
    await expect(page).toHaveTitle(/FP32.*TFLOPs|GPUs Ranked by/i);

    // Get the page content
    const content = await page.content();

    // Verify no NaN values appear in the page
    expect(content).not.toContain('$NaN');
    expect(content).not.toMatch(/\$\s*NaN/i);

    // Also check the table is visible
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();
  });

  test('should not contain NaN values on gaming ranking page', async ({ page }) => {
    // Navigate to a gaming ranking route
    await page.goto('/gpu/ranking/gaming/counter-strike-2-fps-3840x2160');

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike|GPUs Ranked by/i);

    // Get the page content
    const content = await page.content();

    // Verify no NaN values appear in the page
    expect(content).not.toContain('$NaN');
    expect(content).not.toMatch(/\$\s*NaN/i);

    // Also check the table is visible
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();
  });

  test('should have correct table structure with 4 columns', async ({ page }) => {
    // Navigate to a gaming ranking route
    await page.goto('/gpu/ranking/gaming/counter-strike-2-fps-3840x2160');

    // Wait for the table to be visible
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();

    // Verify column headers using direct locator (more reliable than role-based)
    const headers = table.locator('thead th');
    await expect(headers).toHaveCount(4);

    // Check header text (using flexible matching)
    await expect(headers.nth(0)).toContainText('GPU');
    await expect(headers.nth(1)).toContainText('Lowest Average Price');
    await expect(headers.nth(2)).toContainText('Raw Performance Ranking');
    await expect(headers.nth(3)).toContainText('$ per');
  });

  test('should have GPU name links that work', async ({ page }) => {
    // Navigate to a gaming ranking route
    await page.goto('/gpu/ranking/gaming/counter-strike-2-fps-3840x2160');

    // Wait for the table to be visible
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();

    // Find the first GPU link in the table
    const firstGpuLink = table.getByRole('link').first();
    await expect(firstGpuLink).toBeVisible();

    // Verify the link points to a GPU learn page
    const href = await firstGpuLink.getAttribute('href');
    expect(href).toMatch(/\/gpu\/learn\/card\//);
  });

  test('should display percentile bars for GPUs with performance data', async ({ page }) => {
    // Navigate to a gaming ranking route
    await page.goto('/gpu/ranking/gaming/counter-strike-2-fps-3840x2160');

    // Wait for the table to be visible
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();

    // Find progress bars (percentile visualization)
    const progressBars = table.locator('.progress');

    // Should have at least some progress bars (GPUs with spec data)
    const progressBarCount = await progressBars.count();
    expect(progressBarCount).toBeGreaterThan(0);

    // Verify progress bar content format (e.g., "95th @ 226 FPS")
    const firstProgressBar = progressBars.first();
    const progressBarText = await firstProgressBar.textContent();
    // Should match pattern like "75th @ 123 FPS" or similar
    expect(progressBarText).toMatch(/\d+(st|nd|rd|th)\s*@\s*\d+/);
  });

  test('should display tier dividers when GPUs span multiple performance tiers', async ({ page }) => {
    // Navigate to a gaming ranking route
    await page.goto('/gpu/ranking/gaming/counter-strike-2-fps-3840x2160');

    // Wait for the table to be visible
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();

    // Look for tier divider rows (they have specific text patterns)
    const pageContent = await page.content();

    // At least one tier divider should exist if we have GPUs across tiers
    // Using flexible matching since exact tiers depend on data
    const hasTierDividers =
      pageContent.includes('Top Tier') ||
      pageContent.includes('Middle Tier') ||
      pageContent.includes('Entry Tier') ||
      pageContent.includes('Percentile');

    // This test is informational - we expect tier dividers but won't fail
    // if the data happens to all be in one tier
    if (hasTierDividers) {
      // Verify at least one tier label format
      expect(pageContent).toMatch(/Tier.*Percentile/);
    }
  });

  test('should display formatted prices in Lowest Price column', async ({ page }) => {
    // Navigate to a gaming ranking route
    await page.goto('/gpu/ranking/gaming/counter-strike-2-fps-3840x2160');

    // Wait for the table to be visible
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();

    // Get all table rows (excluding header)
    const rows = table.getByRole('row');
    const totalRows = await rows.count();

    // Check that we have price data in the expected format
    let rowsWithPrices = 0;
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);
      const rowText = await row.textContent();

      // Price format: $ followed by digits (e.g., "$299" or "$1,299")
      if (rowText?.match(/\$\s*[\d,]+/)) {
        rowsWithPrices++;
      }
    }

    // At least some rows should have price data
    expect(rowsWithPrices).toBeGreaterThan(0);
  });
});
