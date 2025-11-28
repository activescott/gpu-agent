import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and show at least 1 listing under each card header', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for page to load
    await expect(page).toHaveTitle(/Find the Best GPU for Your Money|GPUPoet|GPU/);
    
    // Find all card headers with class 'my-container-card-header'
    const cardHeaders = page.locator('.my-container-card-header');
    const headerCount = await cardHeaders.count();
    
    // Verify we have at least one card header
    expect(headerCount).toBeGreaterThan(0);
    
    // For each card header, verify it has at least 2 listings
    for (let i = 0; i < headerCount; i++) {
      const header = cardHeaders.nth(i);
      
      // Find the parent container of this header
      const container = header.locator('xpath=..');
      
      // Look for listing items within this container
      // Listings are typically in cards, rows, or list items
      const listings = container.locator('a[href*="/ml/shop/gpu/"], .listing-item, tr:has(a[href*="/ml/shop/gpu/"]), li:has(a[href*="/ml/shop/gpu/"])');
      const listingCount = await listings.count();
      
      // Get header text for better error messages
      const headerText = await header.textContent();
      
      // Verify at least 1 listing under this header (some sections may only show top result)
      expect(listingCount, `Expected at least 1 listing under header "${headerText}", but found ${listingCount}`).toBeGreaterThanOrEqual(1);
    }
  });
});