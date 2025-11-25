import { test, expect } from '@playwright/test';

test.describe('GPU Ranking Page', () => {
  test('should load fp32-flops ranking with all GPUs and numeric cost values', async ({ page }) => {
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

    // Expect header row + GPU rows (we found 26 total rows in testing)
    expect(totalRows).toBeGreaterThanOrEqual(25); // Should have a reasonable number of GPUs

    // Check each data row (skip header row at index 0)
    for (let i = 1; i < totalRows; i++) {
      const row = rows.nth(i);

      // Find the cost per FP32 TFLOPs column
      // Look for cell containing '$ / FP32 TFLOPs' pattern or similar cost indicator
      const costCell = row.getByRole('cell').filter({ hasText: /\$/ }).first();
      await expect(costCell).toBeVisible();

      const costText = await costCell.textContent();

      // Verify it's not N/A and contains a numeric value
      expect(costText).not.toMatch(/N\/A|n\/a|—|null|undefined/i);
      expect(costText).toMatch(/\$\s*[\d,]+(\.\d+)?/); // Should contain $ followed by numbers

      // Extract and verify the numeric part is greater than 0
      const numericMatch = costText?.match(/[\d,]+(\.\d+)?/);
      expect(numericMatch).toBeTruthy();
      if (numericMatch) {
        const numericValue = parseFloat(numericMatch[0].replace(/,/g, ''));
        expect(numericValue).toBeGreaterThan(0);
      }
    }

    // Verify we have a reasonable number of GPU rows
    const dataRowCount = totalRows - 1; // Subtract header row
    expect(dataRowCount).toBeGreaterThanOrEqual(20); // Should have at least 20 different GPUs
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