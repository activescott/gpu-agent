"use client"

import type { JSX } from "react"
import type { FilterConfig, FilterState } from "./types"
import { getFilterSummary } from "./filterLogic"
import { countActiveFilters, hasActiveFilters } from "./urlUtils"

interface FilterSummaryProps {
  filters: FilterState
  configs: FilterConfig[]
  onClearAll: () => void
  onRemoveFilter: (filterName: string) => void
  /** For mobile: callback to open filter panel */
  onOpenFilters?: () => void
}

/**
 * Summary component showing active filters
 * - On mobile: button to open offcanvas with filter count badge
 * - On desktop: active filter chips with clear all
 */
export function FilterSummary({
  filters,
  configs,
  onClearAll,
  onRemoveFilter,
  onOpenFilters,
}: FilterSummaryProps): JSX.Element {
  const activeCount = countActiveFilters(filters)
  const isActive = hasActiveFilters(filters)

  return (
    <div className="filter-summary">
      {/* Mobile: Filter button */}
      {onOpenFilters && (
        <div className="d-lg-none mb-3">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
            onClick={onOpenFilters}
          >
            <span>
              <i className="bi bi-funnel me-2"></i>
              Filters
            </span>
            {activeCount > 0 && (
              <span className="badge bg-primary">{activeCount}</span>
            )}
          </button>
        </div>
      )}

      {/* Desktop: Active filter chips */}
      {isActive && (
        <div className="d-none d-lg-block mb-3">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="text-muted small">Active filters:</span>
            {Object.entries(filters).map(([filterName, filterValue]) => {
              const config = configs.find((c) => c.name === filterName)
              if (!config) return null

              const unit = config.type === "numeric" ? config.unit : undefined
              const summary = getFilterSummary(
                filterValue,
                config.displayName,
                unit,
              )

              return (
                <span
                  key={filterName}
                  className="badge bg-secondary d-flex align-items-center gap-1"
                >
                  {summary}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    style={{ fontSize: "0.6rem" }}
                    aria-label={`Remove ${config.displayName} filter`}
                    onClick={() => onRemoveFilter(filterName)}
                  ></button>
                </span>
              )
            })}
            <button
              type="button"
              className="btn btn-link btn-sm text-muted p-0"
              onClick={onClearAll}
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface FilterMobileButtonProps {
  filterCount: number
  onClick: () => void
}

/**
 * Standalone mobile filter button (for use outside FilterSummary)
 */
export function FilterMobileButton({
  filterCount,
  onClick,
}: FilterMobileButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className="btn btn-outline-secondary d-flex align-items-center gap-2"
      onClick={onClick}
    >
      <i className="bi bi-funnel"></i>
      <span>Filters</span>
      {filterCount > 0 && (
        <span className="badge bg-primary">{filterCount}</span>
      )}
    </button>
  )
}

interface ActiveFilterChipsProps {
  filters: FilterState
  configs: FilterConfig[]
  onRemoveFilter: (filterName: string) => void
  onClearAll: () => void
}

/**
 * Standalone active filter chips (for use in mobile offcanvas header)
 */
export function ActiveFilterChips({
  filters,
  configs,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps): JSX.Element | null {
  if (!hasActiveFilters(filters)) {
    return null
  }

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
      {Object.entries(filters).map(([filterName, filterValue]) => {
        const config = configs.find((c) => c.name === filterName)
        if (!config) return null

        const unit = config.type === "numeric" ? config.unit : undefined
        const summary = getFilterSummary(filterValue, config.displayName, unit)

        return (
          <span
            key={filterName}
            className="badge bg-secondary d-flex align-items-center gap-1"
          >
            {summary}
            <button
              type="button"
              className="btn-close btn-close-white ms-1"
              style={{ fontSize: "0.6rem" }}
              aria-label={`Remove ${config.displayName} filter`}
              onClick={() => onRemoveFilter(filterName)}
            ></button>
          </span>
        )
      })}
      <button
        type="button"
        className="btn btn-link btn-sm text-muted p-0"
        onClick={onClearAll}
      >
        Clear all
      </button>
    </div>
  )
}
