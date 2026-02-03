# Cmd+K Search - Implementation Summary

## What was done

Implemented site-wide search accessible via Cmd+K (Mac) / Ctrl+K (Windows/Linux) or a search button in the header navbar.

## Files Created

1. **`src/app/api/search-data/route.ts`** - API route returning lightweight GPU metadata JSON (name, label, series, category, memoryCapacityGB, fp32TFLOPS) with 1-hour ISR caching.

2. **`src/pkgs/client/hooks/useSearchData.ts`** - React hook that lazily fetches `/api/search-data` on first use and caches results in a module-level variable. Exports `SearchableGpu` type.

3. **`src/pkgs/client/search/searchGpus.ts`** - Pure search function with case-insensitive substring matching. Starts-with matches ranked first. Searches GPUs (up to 8 results) and static pages with title/description (up to 4 results). Results grouped by type: `"gpu"` | `"page"`.

4. **`src/pkgs/client/components/SearchDialog.tsx`** - Modal dialog with search input and grouped results. Features: keyboard navigation (ArrowDown/Up, Enter, Escape), body scroll lock, auto-scroll active item into view, accessibility (role=dialog, aria-modal, role=listbox/option).

5. **`src/pkgs/client/components/SearchTrigger.tsx`** - Header button that registers global keydown listener for Cmd+K/Ctrl+K. Lazy-loads SearchDialog via `dynamic()` with `{ ssr: false }`. Shows search icon always, "Search..." text on md+, keyboard shortcut badge on lg+. Detects OS at runtime for Cmd vs Ctrl display.

6. **`e2e-tests/tests/search.spec.ts`** - Playwright e2e tests covering: trigger visibility, click-to-open, Ctrl+K/Escape keyboard shortcuts, GPU name search with results, arrow key navigation + Enter selection, click-to-navigate, backdrop close, page search results, and empty state.

## Files Modified

7. **`src/pkgs/client/components/SiteHeader.tsx`** - Added `SearchTrigger` import and placed `<SearchTrigger />` between the brand link and nav toggler.

8. **`src/app/style/style.scss`** - Added all search-related SCSS styles including: `.search-trigger` (navbar button), `.search-dialog-backdrop` (z-index 1050), `.search-dialog` (compact, centered at 15% from top, max-width 480px, max-height 60vh), result items with primary color active state, and dark mode compatibility via CSS variables.

## Design Decisions

- Modal positioned at 15% from top of viewport so results expand downward naturally
- Compact dialog (max-width 480px) centered horizontally
- Uses existing BootstrapIcon sprite for all icons (search, gpu-card, file-earmark-text, arrow-return-left)
- No new dependencies added - uses native substring matching (dataset is small)
- Static pages include title and description for future extensibility
- All styles use Bootstrap CSS variables for automatic dark mode support
