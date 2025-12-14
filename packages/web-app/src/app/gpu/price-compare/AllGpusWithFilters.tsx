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
import { ListingGalleryWithMetric } from "@/pkgs/client/components/ListingGalleryWithMetric"
import type { Listing } from "@/pkgs/isomorphic/model"

/** Gaming benchmark definition for filter config */
interface GamingBenchmarkDef {
  slug: string
  name: string
  unit: string
}

interface ListingItemWithBenchmarks {
  item: Listing
  /** Benchmark values for filtering (keyed by benchmark slug) */
  benchmarkValues?: Record<string, number>
}

interface AllGpusWithFiltersProps {
  listings: ListingItemWithBenchmarks[]
  /** Gaming benchmark definitions for filter options */
  gamingBenchmarks?: GamingBenchmarkDef[]
}

/**
 * Client component wrapper that adds filtering to the all GPUs price-compare page
 */
export function AllGpusWithFilters({
  listings,
  gamingBenchmarks,
}: AllGpusWithFiltersProps): JSX.Element {
  const searchParams = useSearchParams()

  // Parse initial filter state from URL
  const initialFilters = useMemo(
    () => parseFiltersFromURL(searchParams),
    [searchParams],
  )

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  // Build filter configs for listings (no current metric since we're showing all)
  const filterConfigs = useMemo<FilterConfig[]>(
    () =>
      buildListingFilterConfigs({
        gamingBenchmarks,
      }),
    [gamingBenchmarks],
  )

  // Apply filters to listings
  // Items with null/undefined values for a filtered field are excluded
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
            benchmarkValues?: Record<string, number>
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

  // Wrap listings for gallery format
  const listingsForGallery = filteredListings.map((l) => ({ item: l.item }))

  // Render filter panel
  const filterPanel = (
    <FilterItems
      configs={filterConfigs}
      filters={filters}
      onFilterChange={handleFilterChange}
      title="Filter GPUs"
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
      <ListingGalleryWithMetric listings={listingsForGallery} />
    </FilterLayout>
  )
}
