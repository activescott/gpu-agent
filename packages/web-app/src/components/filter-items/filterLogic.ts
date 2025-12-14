import type { FilterState, FilterValue } from "./types"

/**
 * Apply filters to an array of items
 *
 * @param items - Array of items to filter
 * @param filters - Current filter state
 * @param getFieldValue - Function to extract a field value from an item
 * @returns Filtered array of items
 *
 * @example
 * const filteredGpus = applyFilters(
 *   gpus,
 *   { memoryCapacityGB: { operator: "gte", value: 8 } },
 *   (gpu, field) => gpu.gpu[field]
 * )
 */
export function applyFilters<T>(
  items: T[],
  filters: FilterState,
  getFieldValue: (item: T, fieldName: string) => unknown,
): T[] {
  // No filters = return all items
  if (Object.keys(filters).length === 0) {
    return items
  }

  return items.filter((item) => {
    // Item must pass ALL filters (AND logic)
    for (const [fieldName, filterValue] of Object.entries(filters)) {
      const itemValue = getFieldValue(item, fieldName)
      if (!matchesFilter(itemValue, filterValue)) {
        return false
      }
    }
    return true
  })
}

/**
 * Check if an item value matches a filter condition
 */
function matchesFilter(itemValue: unknown, filter: FilterValue): boolean {
  const { operator, value, maxValue } = filter

  // Handle null/undefined item values
  if (itemValue === null || itemValue === undefined) {
    return false
  }

  switch (operator) {
    case "eq": {
      return itemValue === value
    }

    case "gt": {
      return toNumber(itemValue) > toNumber(value)
    }

    case "gte": {
      return toNumber(itemValue) >= toNumber(value)
    }

    case "lt": {
      return toNumber(itemValue) < toNumber(value)
    }

    case "lte": {
      return toNumber(itemValue) <= toNumber(value)
    }

    case "range": {
      const numItemValue = toNumber(itemValue)
      const minValue = toNumber(value)
      const maxVal =
        maxValue === undefined ? Number.POSITIVE_INFINITY : maxValue
      return numItemValue >= minValue && numItemValue <= maxVal
    }

    case "in": {
      // For categorical filters: check if item value is in the array
      const filterValues = Array.isArray(value) ? value : [value]
      const itemString = String(itemValue)
      return filterValues.includes(itemString)
    }

    default: {
      // Unknown operator - don't filter
      return true
    }
  }
}

/**
 * Convert a value to a number for comparison
 */
function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * Get a summary of what a filter is doing (for display purposes)
 */
export function getFilterSummary(
  filter: FilterValue,
  displayName: string,
  unit?: string,
): string {
  const { operator, value, maxValue } = filter
  const unitSuffix = unit ? ` ${unit}` : ""

  switch (operator) {
    case "eq": {
      return `${displayName}: ${value}${unitSuffix}`
    }
    case "gt": {
      return `${displayName} > ${value}${unitSuffix}`
    }
    case "gte": {
      return `${displayName} >= ${value}${unitSuffix}`
    }
    case "lt": {
      return `${displayName} < ${value}${unitSuffix}`
    }
    case "lte": {
      return `${displayName} <= ${value}${unitSuffix}`
    }
    case "range": {
      const max = maxValue === undefined ? "∞" : maxValue
      return `${displayName}: ${value}-${max}${unitSuffix}`
    }
    case "in": {
      const values = Array.isArray(value) ? value : [value]
      if (values.length === 1) {
        return `${displayName}: ${values[0]}`
      }
      return `${displayName}: ${values.length} selected`
    }
    default: {
      return `${displayName}: ${value}`
    }
  }
}

/**
 * Get a compact summary string for all active filters
 * @returns String like "Budget <= $500, Memory >= 24GB" or empty string if no filters
 */
export function getAllFiltersSummary(
  filters: FilterState,
  configs: { name: string; displayName: string; type: string; unit?: string }[],
): string {
  const summaries: string[] = []

  for (const [filterName, filterValue] of Object.entries(filters)) {
    const config = configs.find((c) => c.name === filterName)
    if (!config) continue

    const unit = config.type === "numeric" ? config.unit : undefined
    summaries.push(getFilterSummary(filterValue, config.displayName, unit))
  }

  return summaries.join(", ")
}

/**
 * Get human-readable operator label
 */
export function getOperatorLabel(operator: FilterValue["operator"]): string {
  switch (operator) {
    case "eq": {
      return "equals"
    }
    case "gt": {
      return "greater than"
    }
    case "gte": {
      return "at least"
    }
    case "lt": {
      return "less than"
    }
    case "lte": {
      return "at most"
    }
    case "range": {
      return "between"
    }
    case "in": {
      return "is one of"
    }
    default: {
      return operator
    }
  }
}
