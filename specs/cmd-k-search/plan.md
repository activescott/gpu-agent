# Site-wide Cmd+K Search

## Summary

Add a site-wide search feature triggered by Cmd+K (Mac) / Ctrl+K (Windows/Linux) or clicking a search button in the header. Results appear in a small modal overlay positioned near the top of the viewport (centered horizontally, ~15% from top) so results can expand downward. Instant client-side filtering. GPU learn card pages are the primary searchable content; static site pages (rankings, prices, compare, learn) are secondary.

## Architecture

- **Data loading**: New public API route (`/api/search-data`) returns a lightweight JSON array of GPU metadata (~50-100 items, <10KB). Fetched lazily on first search open and cached in a module-level variable.
- **Search algorithm**: Case-insensitive substring match across label + series + category fields. Starts-with matches ranked first. No new dependencies needed (dataset is small enough).
- **UI pattern**: Custom modal overlay (not Bootstrap JS modal -- consistent with existing codebase pattern of avoiding Bootstrap's JS bundle). Backdrop + small centered dialog near top of viewport with search input and grouped results expanding downward.
- **Component architecture**: `SearchTrigger` (header button + keyboard shortcut) -> lazy-loads `SearchDialog` (modal with results).

## Design Notes (User Feedback)

- Modal should be **small and compact**, centered horizontally, positioned closer to the **top** of the viewport (~15% from top) so the results dropdown expands downward naturally
- Static pages should use page **title and description** metadata for future extensibility
- Must include **Playwright e2e tests** covering keyboard shortcuts, search functionality, and navigation

## Files to Create

### 1. `src/app/api/search-data/route.ts` (API route)
- Uses `listGpus()` from `GpuRepository`
- Returns `{ name, label, series, category, memoryCapacityGB, fp32TFLOPS }` for each GPU
- Sets `revalidate = 3600` for ISR caching

### 2. `src/pkgs/client/hooks/useSearchData.ts` (data hook)
- Fetches `/api/search-data` on first use, caches in module-level variable
- Exports `SearchableGpu` type and `useSearchData()` hook
- Returns `{ data, loading }`

### 3. `src/pkgs/client/search/searchGpus.ts` (search logic)
- Pure function: `search(query, gpus) => SearchResult[]`
- Searches GPUs (up to 8 results) + hardcoded static pages with title/description (up to 4 results)
- Static pages: Gaming/AI Rankings, Gaming/AI Prices, Compare, Learn
- Results grouped by type: `"gpu"` | `"page"`
- GPU description shows: `"24 GB | 82.6 TFLOPS | GeForce RTX 40 Series"`

### 4. `src/pkgs/client/components/SearchDialog.tsx` (modal component)
- Backdrop + small compact dialog positioned near top of viewport
- Search input and results list expanding downward
- Keyboard navigation: ArrowDown/Up, Enter to navigate, Escape to close
- Results grouped under "GPUs" and "Pages" headings
- Icons: `gpu-card` for GPUs, `file-earmark-text` for pages, `arrow-return-left` for enter hint
- Accessibility: `role="dialog"`, `aria-modal`, `role="listbox"`, `role="option"`
- Body scroll lock when open
- Auto-scrolls highlighted item into view

### 5. `src/pkgs/client/components/SearchTrigger.tsx` (header trigger)
- Renders clickable search button in navbar
- Registers global `keydown` listener for Cmd+K / Ctrl+K
- Lazy-loads `SearchDialog` via `dynamic(..., { ssr: false })` (same pattern as `SiteHeaderNavItems`)
- Shows search icon always, "Search..." text on md+, keyboard shortcut badge on lg+
- Detects OS at runtime: shows Cmd symbol on Mac, "Ctrl" on Windows/Linux

### 6. `e2e-tests/tests/search.spec.ts` (Playwright e2e tests)
- Test Cmd+K / Ctrl+K opens the search dialog
- Test typing a GPU name shows instant results
- Test ArrowDown/ArrowUp + Enter navigates to selected result
- Test Escape closes the dialog
- Test clicking search button in header opens dialog
- Test clicking a search result navigates to GPU page

## Files to Modify

### 7. `src/pkgs/client/components/SiteHeader.tsx`
- Import `SearchTrigger`
- Add `<SearchTrigger />` between the brand `<Link>` and `<SiteHeaderNavToggler />`

### 8. `src/app/style/style.scss`
- Add search trigger button styles (`.search-trigger`, `.search-trigger-kbd`)
- Add dialog styles (`.search-dialog-backdrop`, `.search-dialog`, `.search-dialog-content`, etc.)
- Uses `var(--bs-body-bg)`, `var(--bs-border-color)`, etc. for dark mode compatibility
- Active/hover state uses `var(--bs-primary)` (dogwood rose)
- z-index 1050/1051 (above navbar at 1030)
- Dialog max-width ~480px, positioned at ~15% from top of viewport
- Mobile: dialog goes full-width with small margin

## Implementation Order

1. API route (testable standalone)
2. Search types and hook
3. Search utility (pure function)
4. SearchDialog component
5. SearchTrigger component
6. SiteHeader integration + SCSS styles
7. Playwright e2e tests

## Verification

1. Run `npm run dev` in `packages/web-app`
2. Verify Cmd+K / Ctrl+K opens the search dialog
3. Type a GPU name (e.g., "4090") and verify instant results with specs shown
4. Arrow keys + Enter navigates to selected result
5. Escape closes the dialog
6. Click search button in header opens dialog
7. Test on mobile viewport: search icon visible, tapping opens full-screen modal
8. Verify dark mode styling via system preference toggle
9. Verify `/api/search-data` returns valid JSON with `curl http://localhost:3000/api/search-data`
10. Run `npx playwright test tests/search.spec.ts` for e2e tests
