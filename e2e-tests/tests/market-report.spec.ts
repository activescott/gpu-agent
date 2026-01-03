import { test, expect } from '@playwright/test';

test.describe('Market Report', () => {
  // Use January 2026 report as test fixture
  const reportPath = '/gpu/market-report/gpu-market-report-january-2026';

  test('page loads with title and key elements', async ({ page }) => {
    await page.goto(reportPath);

    // Check page title
    await expect(page).toHaveTitle(/GPU Market/i);

    // Check for main article structure
    await expect(page.locator('article.blog-post')).toBeVisible();

    // Check for breadcrumb navigation
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toBeVisible();
  });

  test('displays key takeaways cards', async ({ page }) => {
    await page.goto(reportPath);

    // Key takeaways section should have stat cards
    const cards = page.locator('.card').filter({ hasText: /Premium|Deal|Drop/i });
    await expect(cards.first()).toBeVisible();
  });

  test('renders chart sections', async ({ page }) => {
    await page.goto(reportPath);

    // At least one chart container should be visible
    const chartContainer = page.locator('.chart-container').first();
    await expect(chartContainer).toBeVisible();

    // Scroll to the chart container to trigger IntersectionObserver
    await chartContainer.scrollIntoViewIfNeeded();

    // Wait for Chart.js canvas elements (lazy loaded when in view)
    const chartCanvas = page.locator('.chartjs-wrapper canvas');
    await expect(chartCanvas.first()).toBeVisible({ timeout: 10000 });
  });

  test('renders line chart', async ({ page }) => {
    await page.goto(reportPath);

    // Find all chart wrappers and scroll to trigger loading
    const chartWrappers = page.locator('.chartjs-wrapper');
    const count = await chartWrappers.count();

    // Scroll through each chart to trigger lazy loading
    for (let i = 0; i < count; i++) {
      await chartWrappers.nth(i).scrollIntoViewIfNeeded();
    }

    // Wait for canvas elements to render
    const canvasElements = page.locator('.chartjs-wrapper canvas');
    await expect(canvasElements.first()).toBeVisible({ timeout: 10000 });

    // Should have at least one canvas (charts are now all Chart.js)
    const canvasCount = await canvasElements.count();
    expect(canvasCount).toBeGreaterThan(0);
  });

  test('share menu opens and shows options', async ({ page }) => {
    await page.goto(reportPath);

    // Click share button
    const shareButton = page.locator('.share-menu-button').first();
    await shareButton.click();

    // Dropdown should be visible with share options
    const dropdown = page.locator('.share-menu-dropdown.open');
    await expect(dropdown).toBeVisible();

    // Should have Twitter, Reddit, LinkedIn, Copy Link options
    await expect(dropdown.locator('text=Twitter')).toBeVisible();
    await expect(dropdown.locator('text=Reddit')).toBeVisible();
    await expect(dropdown.locator('text=Copy Link')).toBeVisible();
  });

  test('download image button is present', async ({ page }) => {
    await page.goto(reportPath);

    // Click share button to open menu
    const shareButton = page.locator('.share-menu-button').first();
    await shareButton.click();

    // Download button should be visible
    const downloadButton = page.locator('.share-menu-dropdown.open').locator('text=Download Image');
    await expect(downloadButton).toBeVisible();
  });

  test('footer links work', async ({ page }) => {
    await page.goto(reportPath);

    // Check "View Live GPU Prices" button exists and links correctly
    const liveButton = page.locator('a.btn-primary', { hasText: /Live GPU Prices/i });
    await expect(liveButton).toHaveAttribute('href', '/gpu/price-compare');

    // Check "Compare GPUs" button
    const compareButton = page.locator('a.btn-outline-primary', { hasText: /Compare GPUs/i });
    await expect(compareButton).toHaveAttribute('href', '/gpu/compare');
  });
});

test.describe('Market Report Chart Data Validation', () => {
  const reportPath = '/gpu/market-report/gpu-market-report-january-2026';

  test('charts do not show insufficient data alerts', async ({ page }) => {
    await page.goto(reportPath);

    // Scroll through the page to trigger lazy loading of all content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check that no "Insufficient data" alerts are visible
    const insufficientDataAlerts = page.locator('.alert-secondary').filter({
      hasText: /Insufficient.*data/i,
    });
    const alertCount = await insufficientDataAlerts.count();

    // If any alerts are found, list them for debugging
    if (alertCount > 0) {
      const alertTexts: string[] = [];
      for (let i = 0; i < alertCount; i++) {
        alertTexts.push(await insufficientDataAlerts.nth(i).textContent() || '');
      }
      console.log('Found insufficient data alerts:', alertTexts);
    }

    expect(alertCount).toBe(0);
  });

  test('all chart images contain actual data', async ({ request }) => {
    const dateParams = 'from=2026-01&to=2026-01';

    // Minimum image sizes to indicate actual chart data was rendered
    // Empty/minimal charts produce smaller images
    const chartMinimumSizes: Record<string, number> = {
      ScalperPremiumChart: 15_000,   // Bar chart with 4+ bars
      BestDealsChart: 15_000,        // Diverging bar chart with 5 items
      PriceChangesChart: 15_000,     // Diverging bar chart with 5 items
      AmdDealsChart: 15_000,         // Diverging bar chart with 5 items
      PriceHistoryChart: 20_000,     // Line chart with multiple months
    };

    const results: { chart: string; size: number; minSize: number; passed: boolean }[] = [];

    for (const [chart, minSize] of Object.entries(chartMinimumSizes)) {
      const response = await request.get(`/api/images/chart/${chart}?${dateParams}`);
      expect(response.status()).toBe(200);

      const body = await response.body();
      const passed = body.length >= minSize;
      results.push({ chart, size: body.length, minSize, passed });

      if (!passed) {
        console.log(`Chart ${chart} image too small: ${body.length} bytes (min: ${minSize})`);
      }
    }

    // Report all results for debugging
    console.log('Chart image sizes:', results);

    // Assert all charts have sufficient data
    const failures = results.filter((r) => !r.passed);
    expect(failures).toEqual([]);
  });
});

test.describe('Market Report Chart Image API', () => {
  // Date range for January 2026 report
  const dateParams = 'from=2026-01&to=2026-01';

  test('returns valid PNG image', async ({ request }) => {
    // Test the component-based chart image endpoint
    const response = await request.get(`/api/images/chart/ScalperPremiumChart?${dateParams}`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    // Check reasonable image size (should be > 10KB)
    const body = await response.body();
    expect(body.length).toBeGreaterThan(10_000);
  });

  test('handles different chart components', async ({ request }) => {
    const chartComponents = [
      'ScalperPremiumChart',
      'BestDealsChart',
      'PriceChangesChart',
      'AmdDealsChart',
      'PriceHistoryChart',
    ];

    for (const component of chartComponents) {
      const response = await request.get(`/api/images/chart/${component}?${dateParams}`);
      expect(response.status()).toBe(200);
    }
  });

  test('line chart image renders correctly', async ({ request }) => {
    const response = await request.get(`/api/images/chart/PriceHistoryChart?${dateParams}`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    // Check reasonable image size
    const body = await response.body();
    expect(body.length).toBeGreaterThan(10_000);
  });

  test('returns 404 for unknown chart component', async ({ request }) => {
    const response = await request.get(`/api/images/chart/UnknownChart?${dateParams}`);
    expect(response.status()).toBe(404);
  });

  test('returns 400 for missing date parameters', async ({ request }) => {
    const response = await request.get('/api/images/chart/ScalperPremiumChart');
    expect(response.status()).toBe(400);
  });
});
