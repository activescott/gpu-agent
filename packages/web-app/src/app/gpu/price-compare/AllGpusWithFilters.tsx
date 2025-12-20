"use client"

import type { JSX } from "react"
import { getListingFieldValue } from "@/components/gpu/gpuFilterConfig"
import { ListingsWithFilters } from "@/components/gpu/ListingsWithFilters"
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
  benchmarkValues?: Record<string, number>
}

interface AllGpusWithFiltersProps {
  listings: ListingItemWithBenchmarks[]
  gamingBenchmarks?: GamingBenchmarkDef[]
}

/**
 * Client component wrapper that adds filtering to the all GPUs price-compare page
 */
export function AllGpusWithFilters({
  listings,
  gamingBenchmarks,
}: AllGpusWithFiltersProps): JSX.Element {
  // This component serves as the client/server boundary.
  // The parent page.tsx is a server component that fetches data from the database.
  // This wrapper is a client component that enables interactive filtering.
  return (
    <ListingsWithFilters
      listings={listings}
      getFieldValue={getListingFieldValue}
      filterTitle="Filter GPUs"
      gamingBenchmarks={gamingBenchmarks}
    >
      {(filteredListings) => (
        <ListingGalleryWithMetric
          listings={filteredListings.map((l) => ({ item: l.item }))}
        />
      )}
    </ListingsWithFilters>
  )
}
