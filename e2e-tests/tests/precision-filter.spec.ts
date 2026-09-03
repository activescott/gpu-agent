import { test, expect } from "@playwright/test";

function parseShownCount(text: string | null): number {
  const match = text?.match(/Showing (\d+) of (\d+)/i);
  if (!match) throw new Error(`Could not parse shown count from: ${text}`);
  return Number.parseInt(match[1], 10);
}

test.describe("Precision Filter - Ranking Page", () => {
  test("shows Precision Support filter with all boxes unchecked", async ({
    page,
  }) => {
    await page.goto("/gpu/ranking/ai/fp16-flops");

    await expect(
      page.getByRole("button", { name: "Precision Support" }),
    ).toBeVisible();

    const fp8 = page.getByRole("checkbox", { name: "FP8" }).first();
    const fp4 = page.getByRole("checkbox", { name: "FP4" }).first();
    await expect(fp8).toBeVisible();
    await expect(fp8).not.toBeChecked();
    await expect(fp4).not.toBeChecked();
  });

  test("checking a precision narrows results and writes the URL", async ({
    page,
  }) => {
    await page.goto("/gpu/ranking/ai/fp16-flops");

    const table = page.getByRole("table").first();
    await expect(table).toBeVisible();
    const showingText = page.getByText(/Showing \d+ of \d+ GPUs/i);
    await expect(showingText).toBeVisible({ timeout: 5000 });
    const beforeShown = parseShownCount(await showingText.textContent());

    const fp8 = page.getByRole("checkbox", { name: "FP8" }).first();
    await fp8.click();
    await page.waitForTimeout(300);

    expect(page.url()).toContain("filter.precision%5BhasAll%5D=FP8");

    await expect(showingText).toBeVisible({ timeout: 5000 });
    const afterShown = parseShownCount(await showingText.textContent());
    expect(afterShown).toBeLessThanOrEqual(beforeShown);
  });

  test("adding a second required precision never widens the result count", async ({
    page,
  }) => {
    await page.goto("/gpu/ranking/ai/fp16-flops");

    const showingText = page.getByText(/Showing \d+ of \d+ GPUs/i);
    await expect(showingText).toBeVisible({ timeout: 5000 });

    const fp8 = page.getByRole("checkbox", { name: "FP8" }).first();
    await fp8.click();
    await page.waitForTimeout(300);
    await expect(showingText).toBeVisible({ timeout: 5000 });
    const oneCheckedCount = parseShownCount(await showingText.textContent());

    const fp4 = page.getByRole("checkbox", { name: "FP4" }).first();
    await fp4.click();
    await page.waitForTimeout(300);
    await expect(showingText).toBeVisible({ timeout: 5000 });
    const twoCheckedCount = parseShownCount(await showingText.textContent());

    expect(twoCheckedCount).toBeLessThanOrEqual(oneCheckedCount);
  });

  test("deep link restores checked state", async ({ page }) => {
    await page.goto(
      "/gpu/ranking/ai/fp16-flops?filter.precision[hasAll]=FP8,FP4",
    );

    const fp8 = page.getByRole("checkbox", { name: "FP8" }).first();
    const fp4 = page.getByRole("checkbox", { name: "FP4" }).first();
    await expect(fp8).toBeChecked();
    await expect(fp4).toBeChecked();
  });
});

test.describe("Precision Filter - Price Compare Page", () => {
  // The listing sidebar's primary filter group (Budget+Memory+Condition+
  // Marketplace+Precision) is taller than a typical viewport, and its
  // `sticky-top` positioning traps the lower checkboxes out of scroll reach
  // at default heights. Use a taller viewport here so this test exercises
  // the filter logic itself rather than the (separately tracked) layout bug.
  test.use({ viewport: { width: 1280, height: 1600 } });

  test("shows filter and narrows listings", async ({ page }) => {
    await page.goto("/gpu/price-compare/ai/fp16-flops");

    await expect(
      page.getByRole("button", { name: "Precision Support" }),
    ).toBeVisible();

    // The "Showing X of Y listings" summary only renders once a filter is
    // active, so apply the precision filter first and read both counts from
    // that single string rather than trying to capture an unfiltered baseline.
    const fp8 = page.getByRole("checkbox", { name: "FP8" }).first();
    await fp8.scrollIntoViewIfNeeded();
    await fp8.click();
    await page.waitForTimeout(300);

    const showingText = page.getByText(/Showing \d+ of \d+ listings/i);
    await expect(showingText).toBeVisible({ timeout: 20000 });
    const text = await showingText.textContent();
    const match = text?.match(/Showing (\d+) of (\d+)/i);
    expect(match).toBeTruthy();
    const filteredCount = Number.parseInt(match![1], 10);
    const totalCount = Number.parseInt(match![2], 10);
    expect(totalCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(totalCount);
  });
});

test.describe("Precision Filter - Shop Page", () => {
  test("shop page does not render the Precision Support filter", async ({
    page,
  }) => {
    await page.goto("/gpu/shop/nvidia-geforce-rtx-3070", {
      waitUntil: "networkidle",
    });
    await expect(
      page.getByRole("button", { name: "Precision Support" }),
    ).toHaveCount(0);
  });
});

test.describe("Precision Filter - New AI Routes", () => {
  for (const path of [
    "/gpu/ranking/ai/fp8-flops",
    "/gpu/ranking/ai/fp4-flops",
    "/gpu/price-compare/ai/fp8-flops",
    "/gpu/price-compare/ai/fp4-flops",
  ]) {
    test(`${path} returns 200`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });
  }
});
