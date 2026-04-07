# Consistent Sorting Across GPU Listing Pages

## Context
Three listing page types exist with inconsistent sorting:
- **Ranking page** (`/gpu/ranking/[category]/[metric]`): Hardcoded sort by percentile, no user controls. The "$/TOPS" column is visible but not sortable.
- **Price-compare page** (`/gpu/price-compare/[category]/[slug]`): Server-sorted by $/metric, no client sort controls.
- **Shop page** (`/gpu/shop/[gpuSlug]`): Has sort dropdown (`SortPanel`) but defaults to $/fp32TFLOPS, not price.

The user wants: (1) default sort by lowest price everywhere, (2) user-selectable sort field on all pages.

## Plan

### 1. Ranking page: Clickable sortable column headers
**File:** `packages/web-app/src/app/gpu/ranking/[category]/[metric]/GpuMetricsTable.tsx`

- Define `type RankingSortField = "price" | "percentile" | "dollarsPer" | "name"`
- Add `useState` for `sortField` (default `"price"`) and `sortDirection` (default `"asc"`)
- Replace `sortGpusByPercentile` with `sortGpusByField(gpus, field, direction)` using `composeComparers` (already imported from `@/pkgs/isomorphic/collection`). GPUs with no listings always sort to bottom.
- Replace `useEffect` sort with `useMemo` keyed on `[gpuList, sortField, sortDirection]`
- Make `<th>` elements clickable: clicking active column toggles direction, clicking new column sets it active with sensible default direction. Show sort indicator arrow via `BootstrapIcon` (`sort-up`/`sort-down`).
- Only show tier dividers when `sortField === "percentile"` (they're meaningless otherwise)

### 2. Price-compare page: Sort dropdown above card gallery
**File:** `packages/web-app/src/pkgs/client/components/ListingGalleryWithMetric.tsx`

- Define `type PriceCompareSortField = "price" | "dollarsPer"`
- Add `useState` for `sortField` (default `"price"`) and `sortDirection` (default `"asc"`)
- `useMemo` to sort listings by the selected field before rendering cards
- Render a compact dropdown + asc/desc toggle above the card grid, styled like the existing `SortPanel` (Bootstrap `form-select-sm` + `BootstrapIcon` buttons)
- Label the $/metric option using `metricInfo.unitShortest` (e.g., "$/TOPS")

### 3. Shop page: Add "Price" sort option and change default
**Files:**
- `packages/web-app/src/pkgs/client/components/SortPanel.tsx` - Widen `metricKey` type to `GpuMetricKey | "price"`, add "Price (lowest first)" option at top of `<select>`
- `packages/web-app/src/pkgs/client/components/ListingGallery.tsx` - Handle `"price"` key in `sortListings` (sort by raw `priceValue` instead of `price/spec`)
- `packages/web-app/src/app/gpu/shop/[gpuSlug]/page.tsx` - Change default from `"fp32TFLOPS"` to `"price"`, update `isValidMetricKey` to also accept `"price"`
- `packages/web-app/src/app/gpu/shop/[gpuSlug]/ShopListingsWithFilters.tsx` - Update type for `initialSortKey`

## Verification
1. Start dev environment with `./scripts/dev`
2. Visit `/gpu/ranking/ai/tops` - verify default sort is by lowest price, click column headers to re-sort, verify $/TOPS column sorts correctly
3. Visit `/gpu/price-compare/ai/tops` - verify default sort is by price, use dropdown to switch to $/TOPS
4. Visit `/gpu/shop/nvidia-geforce-rtx-4090` - verify default sort is by price, "Price" option appears in dropdown
5. Run `npm run lint` and `npm run build` in `packages/web-app`
