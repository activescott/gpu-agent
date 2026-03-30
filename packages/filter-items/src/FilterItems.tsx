import { useCallback, useState, type JSX } from "react"
import type { FilterConfig, FilterState, FilterValue } from "./types"
import { isCategoricalFilter, isNumericFilter } from "./types"
import { CategoricalFilter } from "./CategoricalFilter"
import { NumericFilter } from "./NumericFilter"
import {
  mergeFilterState,
  clearAllFilters,
  countActiveFilters,
} from "./urlUtils"
import { Collapsible } from "./Collapsible"

const PRIMARY_GROUP_NAME = "Filters"

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
 * Renders filter controls in an exclusive accordion — only one section open at a time.
 * Ungrouped filters appear in the primary section (open by default).
 * Grouped filters appear in their own collapsible sections.
 */
export function FilterItems({
  configs,
  filters,
  onFilterChange,
  title = "Filters",
}: FilterItemsProps): JSX.Element {
  const [openSection, setOpenSection] = useState<string>(PRIMARY_GROUP_NAME)

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

  const handleToggle = useCallback((sectionName: string) => {
    setOpenSection((prev) => (prev === sectionName ? "" : sectionName))
  }, [])

  const activeCount = countActiveFilters(filters)

  const primaryConfigs = configs.filter((c) => !c.group)
  const groups = groupConfigs(configs)

  // Build all accordion sections: primary first, then named groups
  const sections: FilterGroup[] = []
  if (primaryConfigs.length > 0) {
    sections.push({ name: PRIMARY_GROUP_NAME, configs: primaryConfigs })
  }
  sections.push(...groups)

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
          <div className="accordion accordion-flush">
            {sections.map((section) => {
              const sectionActiveCount = countGroupActiveFilters(
                section.configs,
                filters,
              )
              return (
                <Collapsible
                  key={section.name}
                  isOpen={openSection === section.name}
                  onToggle={() => handleToggle(section.name)}
                  title={
                    <>
                      {section.name}
                      {sectionActiveCount > 0 && (
                        <span className="badge bg-primary ms-2">
                          {sectionActiveCount}
                        </span>
                      )}
                    </>
                  }
                >
                  <FilterList
                    configs={section.configs}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </Collapsible>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FilterGroup {
  name: string
  configs: FilterConfig[]
}

/**
 * Groups configs by their `group` property, preserving insertion order.
 * Only returns configs that have a group (ungrouped configs are handled separately).
 */
function groupConfigs(configs: FilterConfig[]): FilterGroup[] {
  const groupMap = new Map<string, FilterConfig[]>()
  for (const config of configs) {
    if (!config.group) continue
    const existing = groupMap.get(config.group)
    if (existing) {
      existing.push(config)
    } else {
      groupMap.set(config.group, [config])
    }
  }
  return [...groupMap.entries()].map(([name, groupConfigs]) => ({
    name,
    configs: groupConfigs,
  }))
}

/**
 * Count how many filters in a group are currently active.
 */
function countGroupActiveFilters(
  configs: FilterConfig[],
  filters: FilterState,
): number {
  let count = 0
  for (const config of configs) {
    if (filters[config.name] !== undefined) {
      count++
    }
  }
  return count
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
