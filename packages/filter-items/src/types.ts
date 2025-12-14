/**
 * Filter operators for comparing values
 * - eq: equal to
 * - gt: greater than
 * - gte: greater than or equal to
 * - lt: less than
 * - lte: less than or equal to
 * - range: between min and max (inclusive)
 * - in: value is in array (for categorical)
 */
export type FilterOperator = "eq" | "gt" | "gte" | "lt" | "lte" | "range" | "in"

/**
 * Represents an active filter value with its operator
 */
export interface FilterValue {
  operator: FilterOperator
  /** The filter value - number for numeric, string/string[] for categorical */
  value: number | string | string[]
  /** For "range" operator, the maximum value (value is the minimum) */
  maxValue?: number
}

/**
 * Configuration for a categorical filter (checkbox multi-select)
 */
export interface CategoricalFilterConfig {
  type: "categorical"
  /** URL parameter key (e.g., "gpuArchitecture") */
  name: string
  /** Display label in UI (e.g., "Architecture") */
  displayName: string
  /** Available options for selection */
  options: FilterOption[]
}

/**
 * A single option in a categorical filter
 */
export interface FilterOption {
  /** Internal value used for filtering */
  value: string
  /** Display label shown to user */
  label: string
}

/**
 * Configuration for a numeric filter (range/comparison)
 */
export interface NumericFilterConfig {
  type: "numeric"
  /** URL parameter key (e.g., "memoryCapacityGB") */
  name: string
  /** Display label in UI (e.g., "Memory") */
  displayName: string
  /** Minimum allowed value */
  min: number
  /** Maximum allowed value */
  max: number
  /** Step increment for inputs */
  step: number
  /** Unit suffix to display (e.g., "GB", "$", "TFLOPS") */
  unit?: string
  /** Default operator when no filter is active (default: "gte") */
  defaultOperator?: "gte" | "lte" | "range"
}

/**
 * Union type for filter configurations
 */
export type FilterConfig = CategoricalFilterConfig | NumericFilterConfig

/**
 * Current state of all active filters
 * Key is the filter name, value is the FilterValue
 */
export type FilterState = Record<string, FilterValue>

/**
 * Type guard to check if a filter config is categorical
 */
export function isCategoricalFilter(
  config: FilterConfig,
): config is CategoricalFilterConfig {
  return config.type === "categorical"
}

/**
 * Type guard to check if a filter config is numeric
 */
export function isNumericFilter(
  config: FilterConfig,
): config is NumericFilterConfig {
  return config.type === "numeric"
}
