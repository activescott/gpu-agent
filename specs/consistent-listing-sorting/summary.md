# Consistent Sorting Across GPU Listing Pages - Summary

## What was done

Added consistent sorting controls to all three GPU listing page types, with lowest price as the default sort.

### 1. Ranking page (`GpuMetricsTable.tsx`)
- Replaced hardcoded percentile sort with clickable sortable column headers
- Four sortable columns: GPU name, Lowest Average Price, Performance Percentile, $/metric
- Default sort: lowest price ascending
- Tier dividers only shown when sorting by percentile (they're meaningless for other sorts)
- Sort indicator icons on column headers (active column shows direction, inactive shows neutral icon)

### 2. Price-compare page (`ListingGalleryWithMetric.tsx`)
- Added sort dropdown above the card gallery with "Price" and "$/metric" options
- Added asc/desc toggle button
- Default sort: lowest price ascending
- Metric option labeled with the page's metric unit (e.g., "$ per TOPS")

### 3. Shop page (`SortPanel.tsx`, `ListingGallery.tsx`, `page.tsx`)
- Added "Price (lowest first)" option to the existing sort dropdown
- Changed default from $/fp32TFLOPS to price
- Widened `SortKey` type from `GpuMetricKey` to `GpuMetricKey | "price"`
- When sorting by price, cards still show the default metric (fp32TFLOPS) for display

## Files changed
- `packages/web-app/src/app/gpu/ranking/[category]/[metric]/GpuMetricsTable.tsx`
- `packages/web-app/src/pkgs/client/components/ListingGalleryWithMetric.tsx`
- `packages/web-app/src/pkgs/client/components/SortPanel.tsx`
- `packages/web-app/src/pkgs/client/components/ListingGallery.tsx`
- `packages/web-app/src/app/gpu/shop/[gpuSlug]/page.tsx`
- `packages/web-app/src/app/gpu/shop/[gpuSlug]/ShopListingsWithFilters.tsx`
