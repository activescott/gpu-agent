// Types
export type {
  FilterOperator,
  FilterValue,
  CategoricalFilterConfig,
  NumericFilterConfig,
  FilterConfig,
  FilterState,
  FilterOption,
} from "./types"

export { isCategoricalFilter, isNumericFilter } from "./types"

// URL utilities
export {
  parseFiltersFromURL,
  serializeFiltersToURL,
  updateURLWithFilters,
  mergeFilterState,
  clearAllFilters,
  hasActiveFilters,
  countActiveFilters,
} from "./urlUtils"

// Filter logic
export {
  applyFilters,
  getFilterSummary,
  getAllFiltersSummary,
  getOperatorLabel,
} from "./filterLogic"

// Components
export { FilterItems } from "./FilterItems"
export { FilterLayout } from "./FilterLayout"
export { CategoricalFilter } from "./CategoricalFilter"
export { NumericFilter } from "./NumericFilter"
export {
  FilterSummary,
  FilterMobileButton,
  ActiveFilterChips,
} from "./FilterSummary"
