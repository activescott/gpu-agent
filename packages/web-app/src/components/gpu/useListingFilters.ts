"use client"

import { useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  parseFiltersFromURL,
  updateURLWithFilters,
  applyFilters,
  type FilterConfig,
  type FilterState,
} from "@/components/filter-items"
import { buildListingFilterConfigs } from "@/components/gpu/gpuFilterConfig"

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

interface UseListingFiltersOptions<T extends FilterableListing> {
  /** The listings to filter */
  listings: T[]
  /** Function to extract field values for filtering */
  getFieldValue: (listing: T, fieldName: string) => unknown
  /** Whether to include GPU spec filters (Memory, etc.). Default: true */
  includeSpecFilters?: boolean
  /** Gaming benchmark definitions for cross-category filtering */
  gamingBenchmarks?: GamingBenchmarkDef[]
  /** Current page's metric slug (to skip adding it as a separate filter) */
  currentMetricSlug?: string
}

interface UseListingFiltersResult<T> {
  /** Current filter state */
  filters: FilterState
  /** Listings after applying filters */
  filteredListings: T[]
  /** Filter configurations for rendering */
  filterConfigs: FilterConfig[]
  /** Handler for filter changes */
  handleFilterChange: (newFilters: FilterState) => void
  /** Total count of listings before filtering */
  totalCount: number
  /** Count of listings after filtering */
  filteredCount: number
  /** Whether any filters are active */
  hasActiveFilters: boolean
}

/**
 * Custom hook for listing filter logic.
 * Handles filter state, URL sync, and applying filters to listings.
 * Used by AllGpusWithFilters, PriceCompareWithFilters, and ShopListingsWithFilters.
 */
export function useListingFilters<T extends FilterableListing>({
  listings,
  getFieldValue,
  includeSpecFilters = true,
  gamingBenchmarks,
  currentMetricSlug,
}: UseListingFiltersOptions<T>): UseListingFiltersResult<T> {
  const searchParams = useSearchParams()

  // Parse initial filter state from URL
  const initialFilters = useMemo(
    () => parseFiltersFromURL(searchParams),
    [searchParams],
  )

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  // Derive max price from actual listings
  const maxPrice = useMemo(() => {
    if (listings.length === 0) return
    return Math.max(
      ...listings.map((l) => Number.parseFloat(l.item.priceValue)),
    )
  }, [listings])

  // Derive unique countries from listings
  const countries = useMemo(() => {
    const countrySet = new Set<string>()
    for (const listing of listings) {
      if (listing.item.itemLocationCountry) {
        countrySet.add(listing.item.itemLocationCountry)
      }
    }
    return [...countrySet].sort()
  }, [listings])

  // Build filter configs
  const filterConfigs = useMemo<FilterConfig[]>(
    () =>
      buildListingFilterConfigs({
        includeSpecFilters,
        gamingBenchmarks,
        currentMetricSlug,
        maxPrice,
        countries,
      }),
    [
      includeSpecFilters,
      gamingBenchmarks,
      currentMetricSlug,
      maxPrice,
      countries,
    ],
  )

  // Apply filters to listings
  const filteredListings = useMemo(
    () => applyFilters(listings, filters, getFieldValue),
    [listings, filters, getFieldValue],
  )

  // Handle filter changes - update state and URL
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    updateURLWithFilters(newFilters)
  }, [])

  return {
    filters,
    filteredListings,
    filterConfigs,
    handleFilterChange,
    totalCount: listings.length,
    filteredCount: filteredListings.length,
    hasActiveFilters: filteredListings.length !== listings.length,
  }
}
