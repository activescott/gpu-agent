import { test, expect } from '@playwright/test';

test.describe('Navigation Links', () => {
  test('all navigation links from homepage should load without errors', async ({ page }) => {
    // Increase timeout for this test as it visits many pages
    test.setTimeout(60000);
    // Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/GPU/i);

    // Extract all internal navigation links (excluding static assets and external redirects)
    const links = await page.locator('a[href^="/"]').evaluateAll((elements) =>
      elements
        .map((el) => el.getAttribute('href'))
        .filter((href): href is string => href !== null)
        .filter((href) => !href.startsWith('/_next'))
        .filter((href) => !href.includes('.svg'))
        .filter((href) => !href.includes('.ico'))
        .filter((href) => href !== '/')
        .filter((href) => !href.startsWith('/bye')) // Exclude external redirect links
    );

    // Get unique links
    const uniqueLinks = [...new Set(links)];

    console.log(`Found ${uniqueLinks.length} unique navigation links to test`);

    // Test each link
    const failedLinks: { link: string; status: number; error?: string }[] = [];

    for (const link of uniqueLinks) {
      const response = await page.goto(link);
      const status = response?.status() ?? 0;

      if (status >= 400) {
        const content = await page.content();
        const hasError =
          content.includes('Unknown slug') ||
          content.includes('Application error') ||
          content.includes('404') ||
          content.includes('This page could not be found');

        failedLinks.push({
          link,
          status,
          error: hasError ? 'Page shows error content' : undefined,
        });
      }
    }

    // Report all failures
    if (failedLinks.length > 0) {
      console.log('Failed links:');
      for (const { link, status, error } of failedLinks) {
        console.log(`  ${status}: ${link}${error ? ` - ${error}` : ''}`);
      }
    }

    expect(failedLinks).toHaveLength(0);
  });

  test('navigation links should not use old URL patterns', async ({ page }) => {
    await page.goto('/');

    // Extract all internal links
    const links = await page.locator('a[href]').evaluateAll((elements) =>
      elements
        .map((el) => el.getAttribute('href'))
        .filter((href): href is string => href !== null)
    );

    const problematicLinks: { link: string; issue: string }[] = [];

    for (const link of links) {
      // Check for old /ml/ paths that should be /gpu/
      if (link.startsWith('/ml/shop/gpu') || link.startsWith('/ml/learn/gpu/ranking')) {
        problematicLinks.push({ link, issue: 'Uses old /ml/ path instead of /gpu/' });
      }

      // Check for relative paths (missing leading /)
      if (link.match(/^ml\//)) {
        problematicLinks.push({ link, issue: 'Relative path missing leading /' });
      }

      // Check for old cost-per-* slugs in price-compare URLs
      if (link.includes('/gpu/price-compare/') && link.includes('cost-per-')) {
        problematicLinks.push({ link, issue: 'Uses old cost-per-* slug format' });
      }
    }

    if (problematicLinks.length > 0) {
      console.log('Problematic links found:');
      for (const { link, issue } of problematicLinks) {
        console.log(`  ${link} - ${issue}`);
      }
    }

    expect(problematicLinks).toHaveLength(0);
  });
});
