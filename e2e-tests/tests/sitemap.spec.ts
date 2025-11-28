import { test, expect } from '@playwright/test';

test.describe('Sitemap', () => {
  test('should load sitemap.xml with expected URLs and gpupoet.com domain', async ({ page }) => {
    // Navigate to sitemap
    const response = await page.goto('/sitemap.xml');
    
    // Verify response is successful
    expect(response?.status()).toBe(200);
    
    // Verify content type is XML
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('xml');
    
    // Get the raw sitemap content from the response text (not browser-rendered)
    const content = await response?.text() || '';   

    // Count URL entries
    const urlMatches = content.match(/<url>/g);
    const urlCount = urlMatches ? urlMatches.length : 0;
    
    // Verify we have at least 71 URLs (current baseline)
    expect(urlCount).toBeGreaterThanOrEqual(71);
    
    // Verify all URLs use gpupoet.com domain
    const locMatches = content.match(/<loc>([^<]+)<\/loc>/g);
    if (!locMatches) {
      throw new Error('No <loc> entries found in sitemap.xml');
    }
    expect(locMatches.length).toBeGreaterThan(0);
    
    // Check each URL uses the correct domain
    for (const locMatch of locMatches!) {
      const url = locMatch.replace(/<\/?loc>/g, '');
      expect(url).toMatch(/^https:\/\/gpupoet\.com\//);
    }   
  });
});
