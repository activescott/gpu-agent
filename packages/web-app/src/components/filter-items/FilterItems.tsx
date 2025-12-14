"use client"

import { useCallback, type JSX } from "react"
import type { FilterConfig, FilterState, FilterValue } from "./types"
import { isCategoricalFilter, isNumericFilter } from "./types"
import { CategoricalFilter } from "./CategoricalFilter"
import { NumericFilter } from "./NumericFilter"
import {
  mergeFilterState,
  clearAllFilters,
  countActiveFilters,
} from "./urlUtils"

interface FilterItemsProps {
  /** Filter configurations defining available filters */
  configs: FilterConfig[]
  /** Current filter state */
  filters: FilterState
  /** Callback when filters change */
  onFilterChange: (filters: FilterState) => void
  /** Optional title for the filter panel */
  title?: string
}

/**
 * Main filter container component
 * Renders filter controls - for use in FilterLayout which handles responsive layout
 */
export function FilterItems({
  configs,
  filters,
  onFilterChange,
  title = "Filters",
}: FilterItemsProps): JSX.Element {
  const handleFilterChange = useCallback(
    (filterName: string, value: FilterValue | null) => {
      const newFilters = mergeFilterState(filters, filterName, value)
      onFilterChange(newFilters)
    },
    [filters, onFilterChange],
  )

  const handleClearAll = useCallback(() => {
    onFilterChange(clearAllFilters())
  }, [onFilterChange])

  const activeCount = countActiveFilters(filters)

  return (
    <div className="filter-sidebar sticky-top" style={{ top: "1rem" }}>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{title}</h5>
          {activeCount > 0 && (
            <button
              type="button"
              className="btn btn-link btn-sm text-muted p-0"
              onClick={handleClearAll}
            >
              Clear all
            </button>
          )}
        </div>
        <div className="card-body">
          <FilterList
            configs={configs}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  )
}

interface FilterListProps {
  configs: FilterConfig[]
  filters: FilterState
  onFilterChange: (filterName: string, value: FilterValue | null) => void
}

/**
 * Renders the list of filter controls
 */
function FilterList({
  configs,
  filters,
  onFilterChange,
}: FilterListProps): JSX.Element {
  return (
    <div className="filter-list d-flex flex-column gap-4">
      {configs.map((config) => {
        const currentValue = filters[config.name]

        if (isCategoricalFilter(config)) {
          return (
            <CategoricalFilter
              key={config.name}
              config={config}
              currentValue={currentValue}
              onChange={(value) => onFilterChange(config.name, value)}
            />
          )
        }

        if (isNumericFilter(config)) {
          return (
            <NumericFilter
              key={config.name}
              config={config}
              currentValue={currentValue}
              onChange={(value) => onFilterChange(config.name, value)}
            />
          )
        }

        return null
      })}
    </div>
  )
}
