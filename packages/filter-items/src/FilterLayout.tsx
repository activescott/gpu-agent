import { useState, useCallback, type JSX, type ReactNode } from "react"
import type { FilterConfig, FilterState } from "./types"
import { ActiveFilterChips } from "./FilterSummary"
import {
  mergeFilterState,
  clearAllFilters,
  countActiveFilters,
} from "./urlUtils"
import { getAllFiltersSummary } from "./filterLogic"

interface FilterLayoutProps {
  /** Filter panel content */
  filterPanel: JSX.Element
  /** Main content */
  children: ReactNode
  /** Current filter state (for mobile summary) */
  filters: FilterState
  /** Filter configs (for mobile summary) */
  configs: FilterConfig[]
  /** Callback when filters change */
  onFilterChange: (filters: FilterState) => void
}

/**
 * Responsive layout wrapper for filter + content
 * Desktop: sidebar on left, content on right
 * Mobile: filter button at top, offcanvas for filters
 */
export function FilterLayout({
  filterPanel,
  children,
  filters,
  configs,
  onFilterChange,
}: FilterLayoutProps): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleRemoveFilter = useCallback(
    (filterName: string) => {
      const newFilters = mergeFilterState(filters, filterName, null)
      onFilterChange(newFilters)
    },
    [filters, onFilterChange],
  )

  const handleClearAll = useCallback(() => {
    onFilterChange(clearAllFilters())
  }, [onFilterChange])

  const activeCount = countActiveFilters(filters)

  // Generate summary string for mobile view (e.g., "Budget <= $500, Memory >= 24GB")
  const filterSummary = getAllFiltersSummary(filters, configs)

  return (
    <div className="row">
      {/* Mobile: Filter button (visible on screens < lg) */}
      <div className="col-12 d-lg-none mb-3">
        <button
          type="button"
          className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
          onClick={() => setMobileOpen(true)}
        >
          {/* Left side: icon + either summary text or "Filters" */}
          <span
            className="d-flex align-items-center text-start"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
              flex: 1,
            }}
          >
            <i className="bi bi-funnel me-2 flex-shrink-0"></i>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {filterSummary || "Filters"}
            </span>
          </span>
          {/* Right side: badge with count */}
          {activeCount > 0 && (
            <span className="badge bg-primary ms-2 flex-shrink-0">
              {activeCount}
            </span>
          )}
        </button>

        {/* Mobile Offcanvas */}
        <div
          className={`offcanvas offcanvas-start ${mobileOpen ? "show" : ""}`}
          tabIndex={-1}
          style={{ visibility: mobileOpen ? "visible" : "hidden" }}
          aria-labelledby="filterOffcanvasLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="filterOffcanvasLabel">
              Filters
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ActiveFilterChips
              filters={filters}
              configs={configs}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAll}
            />
            {filterPanel}
          </div>
        </div>

        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="offcanvas-backdrop fade show"
            onClick={() => setMobileOpen(false)}
          ></div>
        )}
      </div>

      {/* Desktop: Filter sidebar (visible on screens >= lg) */}
      <div className="col-lg-3 d-none d-lg-block">{filterPanel}</div>

      {/* Main content */}
      <div className="col-12 col-lg-9">
        {/* Desktop: Active filter chips above content */}
        <div className="d-none d-lg-block">
          <ActiveFilterChips
            filters={filters}
            configs={configs}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAll}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
