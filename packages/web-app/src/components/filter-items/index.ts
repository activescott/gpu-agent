"use client"

// Re-export used items from the @activescott/filter-items package
// The "use client" directive is needed for Next.js to treat these as client components

// Types
export type {
  CategoricalFilterConfig,
  NumericFilterConfig,
  FilterConfig,
  FilterState,
} from "@activescott/filter-items"

// URL utilities
export {
  parseFiltersFromURL,
  updateURLWithFilters,
} from "@activescott/filter-items"

// Filter logic
export { applyFilters } from "@activescott/filter-items"

// Components
export { FilterItems, FilterLayout } from "@activescott/filter-items"
