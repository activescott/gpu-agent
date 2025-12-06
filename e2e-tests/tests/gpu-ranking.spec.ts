import { test, expect } from '@playwright/test';

// Minimum percentage of GPUs that should have listings
const MIN_LISTINGS_PERCENT = 50;
// Minimum percentage of GPUs that should have the spec data
const MIN_SPEC_PERCENT = 75;

test.describe('GPU Ranking Page', () => {
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

      // Check if row has spec data (doesn't say "no spec" for this metric)
      if (!rowText?.includes('no spec')) {
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
});
