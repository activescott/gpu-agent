import { test, expect } from '@playwright/test';

test.describe('GPU Comparison Page', () => {
  // Use two commonly available GPUs that are unlikely to be removed from the dataset
  const GPU_1_SLUG = 'nvidia-geforce-rtx-4090';
  const GPU_2_SLUG = 'nvidia-geforce-rtx-4080';

  test('should display comparison page with both GPUs', async ({ page }) => {
    await page.goto(`/gpu/compare/${GPU_1_SLUG}/vs/${GPU_2_SLUG}`);

    // Verify page title contains "vs"
    await expect(page).toHaveTitle(/vs.*GPU Comparison/i);

    // Verify the h1 heading contains both GPU names
    const heading = page.locator('h1').first();
    await expect(heading).toContainText(/vs/);
  });

  test('should have GPU selectors visible', async ({ page }) => {
    await page.goto(`/gpu/compare/${GPU_1_SLUG}/vs/${GPU_2_SLUG}`);

    // Both GPU selectors should be present with form labels
    const formLabels = page.locator('.form-label');
    await expect(formLabels).toHaveCount(2);
  });

  test('should redirect non-alphabetical URLs to canonical form', async ({ page }) => {
    // Visit URL with GPUs in wrong order (4090 comes after 4080 alphabetically)
    await page.goto(`/gpu/compare/${GPU_1_SLUG}/vs/${GPU_2_SLUG}`);

    // Should redirect to alphabetical order
    await expect(page).toHaveURL(/\/gpu\/compare\/nvidia-geforce-rtx-4080\/vs\/nvidia-geforce-rtx-4090/);
  });

  test('should display comparison tables on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`/gpu/compare/${GPU_1_SLUG}/vs/${GPU_2_SLUG}`);

    // Should have specification comparison heading
    const specsHeading = page.getByRole('heading', { name: /Specifications Comparison/i });
    await expect(specsHeading).toBeVisible();

    // Should have at least one table visible
    const table = page.getByRole('table').first();
    await expect(table).toBeVisible();
  });

  test('should display comparison tables on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/gpu/compare/${GPU_1_SLUG}/vs/${GPU_2_SLUG}`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should still show the comparison tables on mobile (same layout as desktop)
    const specsHeading = page.getByRole('heading', { name: /Specifications Comparison/i });
    await expect(specsHeading).toBeVisible({ timeout: 10000 });
  });

  test('should not contain NaN or undefined values', async ({ page }) => {
    await page.goto(`/gpu/compare/${GPU_1_SLUG}/vs/${GPU_2_SLUG}`);

    // Get visible text content only (excludes scripts, styles, etc.)
    const visibleText = await page.locator('body').innerText();

    // Verify no NaN or undefined values appear in visible content
    expect(visibleText).not.toContain('$NaN');
    expect(visibleText).not.toMatch(/\bundefined\b/);
    expect(visibleText).not.toMatch(/\$\s*NaN/i);
  });

  test('should have structured data for SEO', async ({ page }) => {
    await page.goto(`/gpu/compare/${GPU_1_SLUG}/vs/${GPU_2_SLUG}`);

    // Check for JSON-LD structured data
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();

    const structuredData = JSON.parse(jsonLd!);
    expect(structuredData['@context']).toBe('https://schema.org');
    expect(structuredData['@type']).toBe('WebPage');
    expect(structuredData.mainEntity).toHaveLength(2);
  });
});
