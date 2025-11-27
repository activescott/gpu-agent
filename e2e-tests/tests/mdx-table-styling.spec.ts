import { test, expect } from '@playwright/test';

test.describe('MDX Table Styling', () => {
  test('should add table class to GFM tables in MDX pages', async ({ page }) => {
    // Navigate to a page with a GFM table
    await page.goto('/ml/learn/use-case/language-processing');
    
    // Wait for the page heading to ensure content is loaded
    await expect(page.locator('h1')).toContainText('Language Processing');
    
    // Find all table elements
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    // Verify we have at least one table
    expect(tableCount).toBeGreaterThan(0);
    
    // Verify each table has the 'table' class
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      await expect(table).toHaveClass(/table/);
    }
  });
});
