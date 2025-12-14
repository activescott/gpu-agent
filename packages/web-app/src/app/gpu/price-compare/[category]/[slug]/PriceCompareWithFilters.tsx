"use client"

import { useState, useCallback, useMemo, type JSX } from "react"
import { useSearchParams } from "next/navigation"
import {
  FilterItems,
  FilterLayout,
  parseFiltersFromURL,
  updateURLWithFilters,
  applyFilters,
  type FilterConfig,
  type FilterState,
} from "@/components/filter-items"
import {
  buildListingFilterConfigs,
  getListingFieldValue,
} from "@/components/gpu/gpuFilterConfig"
import {
  ListingGalleryWithMetric,
  type MetricInfo,
} from "@/pkgs/client/components/ListingGalleryWithMetric"
import type { ListingWithMetric } from "@/pkgs/isomorphic/model"

/** Gaming benchmark definition for filter config */
interface GamingBenchmarkDef {
  slug: string
  name: string
  unit: string
}

interface ListingItemWithMetric {
  item: ListingWithMetric
  /** Benchmark values for filtering (keyed by benchmark slug) */
  benchmarkValues?: Record<string, number>
}

interface PriceCompareWithFiltersProps {
  listings: ListingItemWithMetric[]
  metricInfo: MetricInfo
  /** Gaming benchmark definitions for filter options */
  gamingBenchmarks?: GamingBenchmarkDef[]
}

/**
 * Client component wrapper that adds filtering to the price-compare page
 */
export function PriceCompareWithFilters({
  listings,
  metricInfo,
  gamingBenchmarks,
}: PriceCompareWithFiltersProps): JSX.Element {
  const searchParams = useSearchParams()

  // Parse initial filter state from URL
  const initialFilters = useMemo(
    () => parseFiltersFromURL(searchParams),
    [searchParams],
  )

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  // Build filter configs for listings
  const filterConfigs = useMemo<FilterConfig[]>(
    () =>
      buildListingFilterConfigs({
        gamingBenchmarks,
        currentMetricSlug: metricInfo.slug,
      }),
    [gamingBenchmarks, metricInfo.slug],
  )

  // Apply filters to listings
  const filteredListings = useMemo(
    () =>
      applyFilters(listings, filters, (listing, fieldName) =>
        getListingFieldValue(
          listing as {
            item: {
              priceValue: string
              condition: string
              gpu: Record<string, unknown>
            }
          },
          fieldName,
        ),
      ),
    [listings, filters],
  )

  // Handle filter changes - update state and URL
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    updateURLWithFilters(newFilters)
  }, [])

  // Render filter panel
  const filterPanel = (
    <FilterItems
      configs={filterConfigs}
      filters={filters}
      onFilterChange={handleFilterChange}
      title="Filter Listings"
    />
  )

  return (
    <FilterLayout
      filterPanel={filterPanel}
      filters={filters}
      configs={filterConfigs}
      onFilterChange={handleFilterChange}
    >
      {/* Show filtered count if different from total */}
      {filteredListings.length !== listings.length && (
        <div className="text-muted mb-2">
          Showing {filteredListings.length} of {listings.length} listings
        </div>
      )}
      <ListingGalleryWithMetric
        listings={filteredListings}
        metricInfo={metricInfo}
      />
    </FilterLayout>
  )
}
