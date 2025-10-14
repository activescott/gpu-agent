import { test, expect } from '@playwright/test';

test.describe('Historical Data Page', () => {
  test('should access internal historical data page and API endpoint', async ({ page }) => {
    // Test that the historical data API endpoint works
    const apiResponse = await page.request.get('/internal/api/historical/RTX%204090?months=1');
    expect(apiResponse.status()).toBe(200);
    
    const apiData = await apiResponse.json();
    expect(apiData).toHaveProperty('gpuName');
    expect(apiData).toHaveProperty('priceHistory');
    expect(apiData).toHaveProperty('availabilityTrends');
    expect(apiData).toHaveProperty('volatilityStats');
    expect(apiData.gpuName).toBe('RTX 4090');
  });
  
  test('should load historical data page route without 404', async ({ page }) => {
    // Just verify the route exists and doesn't return 404
    const response = await page.goto('/internal/historical-data', { waitUntil: 'commit' });
    expect(response?.status()).toBe(200);
    
    // Verify it's not a 404 page by checking the URL didn't change
    expect(page.url()).toContain('/internal/historical-data');
  });
});