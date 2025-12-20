"use client"

import { type JSX, type ReactNode } from "react"
import { FilterItems, FilterLayout } from "@/components/filter-items"
import { useListingFilters } from "@/components/gpu/useListingFilters"

/** Gaming benchmark definition for filter config */
interface GamingBenchmarkDef {
  slug: string
  name: string
  unit: string
}

/** Common listing structure for filtering */
interface FilterableListing {
  item: {
    priceValue: string
    condition: string | null
    itemLocationCountry?: string | null
  }
}

interface ListingsWithFiltersProps<T extends FilterableListing> {
  /** The listings to filter */
  listings: T[]
  /** Function to extract field values for filtering */
  getFieldValue: (listing: T, fieldName: string) => unknown
  /** Title for the filter panel */
  filterTitle?: string
  /** Whether to include GPU spec filters (Memory, etc.). Default: true */
  includeSpecFilters?: boolean
  /** Gaming benchmark definitions for cross-category filtering */
  gamingBenchmarks?: GamingBenchmarkDef[]
  /** Current page's metric slug (to skip adding it as a separate filter) */
  currentMetricSlug?: string
  /** Render prop for the gallery - receives filtered listings */
  children: (filteredListings: T[]) => ReactNode
}

/**
 * Reusable component that wraps listing galleries with filter UI.
 * Handles all filter state, URL sync, and layout.
 * Uses a render prop pattern to allow custom gallery rendering.
 */
export function ListingsWithFilters<T extends FilterableListing>({
  listings,
  getFieldValue,
  filterTitle = "Filter Listings",
  includeSpecFilters = true,
  gamingBenchmarks,
  currentMetricSlug,
  children,
}: ListingsWithFiltersProps<T>): JSX.Element {
  const {
    filters,
    filteredListings,
    filterConfigs,
    handleFilterChange,
    totalCount,
    filteredCount,
    hasActiveFilters,
  } = useListingFilters({
    listings,
    getFieldValue,
    includeSpecFilters,
    gamingBenchmarks,
    currentMetricSlug,
  })

  const filterPanel = (
    <FilterItems
      configs={filterConfigs}
      filters={filters}
      onFilterChange={handleFilterChange}
      title={filterTitle}
    />
  )

  return (
    <FilterLayout
      filterPanel={filterPanel}
      filters={filters}
      configs={filterConfigs}
      onFilterChange={handleFilterChange}
    >
      {hasActiveFilters && (
        <div className="text-muted mb-2">
          Showing {filteredCount} of {totalCount} listings
        </div>
      )}
      {children(filteredListings)}
    </FilterLayout>
  )
}
