import debounce from "lodash-es/debounce"
import type { FilterOperator, FilterState, FilterValue } from "./types"

/**
 * URL parameter prefix for filters
 */
const FILTER_PREFIX = "filter."

/**
 * Regex to parse filter parameters like "filter.memory[gte]" or "filter.condition[in]"
 * Captures: name and operator
 */
const FILTER_PARAM_REGEX = /^filter\.([^[]+)\[([^\]]+)]$/

/**
 * Valid operators for URL parsing
 */
const VALID_OPERATORS = new Set<FilterOperator>([
  "eq",
  "gt",
  "gte",
  "lt",
  "lte",
  "range",
  "in",
])

/**
 * Parse filter state from URL search parameters
 *
 * @example
 * URL: "?filter.memory[gte]=8&filter.condition[in]=New,Used"
 * Returns: { memory: { operator: "gte", value: 8 }, condition: { operator: "in", value: ["New", "Used"] }}
 */
export function parseFiltersFromURL(
  searchParams: URLSearchParams,
): FilterState {
  const filters: FilterState = {}

  for (const [key, value] of searchParams.entries()) {
    const match = key.match(FILTER_PARAM_REGEX)
    if (!match) continue

    const [, name, operatorStr] = match
    const operator = operatorStr as FilterOperator

    if (!VALID_OPERATORS.has(operator)) continue

    // Parse the value based on operator type
    let parsedValue: FilterValue["value"]
    let maxValue: number | undefined

    if (operator === "in") {
      // Categorical: comma-separated values
      parsedValue = value.split(",").map((v) => v.trim())
    } else if (operator === "range") {
      // Range: "min,max" format
      const parts = value.split(",")
      const minVal = Number.parseFloat(parts[0])
      const maxVal = parts[1] ? Number.parseFloat(parts[1]) : undefined
      if (Number.isNaN(minVal)) continue
      parsedValue = minVal
      maxValue = maxVal
    } else {
      // Numeric operators: try to parse as number
      const numValue = Number.parseFloat(value)
      parsedValue = Number.isNaN(numValue) ? value : numValue
    }

    filters[name] = {
      operator,
      value: parsedValue,
      ...(maxValue !== undefined && { maxValue }),
    }
  }

  return filters
}

/**
 * Serialize filter state to URL search parameters
 *
 * @example
 * Input: { memory: { operator: "gte", value: 8 }, condition: { operator: "in", value: ["New", "Used"] }}
 * Returns URLSearchParams with: "filter.memory[gte]=8&filter.condition[in]=New,Used"
 */
export function serializeFiltersToURL(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()

  for (const [name, filterValue] of Object.entries(filters)) {
    const { operator, value, maxValue } = filterValue
    const paramKey = `${FILTER_PREFIX}${name}[${operator}]`

    let paramValue: string
    if (Array.isArray(value)) {
      // Categorical: join with commas
      paramValue = value.join(",")
    } else if (operator === "range" && maxValue !== undefined) {
      // Range: "min,max" format
      paramValue = `${value},${maxValue}`
    } else {
      paramValue = String(value)
    }

    params.set(paramKey, paramValue)
  }

  return params
}

/**
 * Debounce delay for URL updates (ms)
 * This prevents "Too many calls to Location or History APIs" errors
 * when filters change rapidly (e.g., dragging a slider)
 */
const URL_UPDATE_DEBOUNCE_MS = 150

/**
 * Internal function that performs the actual URL update.
 * Called by the debounced wrapper.
 */
function performURLUpdate(filters: FilterState): void {
  // Guard: only run in browser environment
  if (typeof window === "undefined") {
    return
  }

  const currentUrl = new URL(window.location.href)
  const newParams = new URLSearchParams()

  // Copy non-filter params
  for (const [key, value] of currentUrl.searchParams.entries()) {
    if (!key.startsWith(FILTER_PREFIX)) {
      newParams.set(key, value)
    }
  }

  // Add new filter params
  const filterParams = serializeFiltersToURL(filters)
  for (const [key, value] of filterParams.entries()) {
    newParams.set(key, value)
  }

  // Build new URL
  const newUrl = `${currentUrl.pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`

  // Use history.replaceState to update URL without triggering navigation
  window.history.replaceState(window.history.state, "", newUrl)
}

/**
 * Debounced URL updater to prevent "Too many calls to History APIs" errors.
 * The History API throws SecurityError/DOMException when called too frequently.
 */
const debouncedURLUpdate = debounce(performURLUpdate, URL_UPDATE_DEBOUNCE_MS)

/**
 * Update the browser URL with new filter state.
 * Preserves existing non-filter parameters.
 *
 * NOTE: This function only works in browser environments. It uses
 * window.history.replaceState() to update the URL without triggering
 * navigation or page reloads.
 *
 * URL updates are debounced (150ms) to prevent "Too many calls to
 * Location or History APIs" errors when filters change rapidly.
 */
export function updateURLWithFilters(filters: FilterState): void {
  debouncedURLUpdate(filters)
}

/**
 * Merge new filter values into existing filter state
 * If a filter value becomes empty (e.g., no categories selected), remove it
 */
export function mergeFilterState(
  currentFilters: FilterState,
  filterName: string,
  newValue: FilterValue | null,
): FilterState {
  const updated = { ...currentFilters }

  if (newValue === null) {
    // Remove the filter
    delete updated[filterName]
  } else {
    updated[filterName] = newValue
  }

  return updated
}

/**
 * Clear all filters
 */
export function clearAllFilters(): FilterState {
  return {}
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return Object.keys(filters).length > 0
}

/**
 * Count the number of active filters
 */
export function countActiveFilters(filters: FilterState): number {
  return Object.keys(filters).length
}
