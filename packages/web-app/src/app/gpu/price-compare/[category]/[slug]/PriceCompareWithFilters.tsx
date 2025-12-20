"use client"

import type { JSX } from "react"
import { getListingFieldValue } from "@/components/gpu/gpuFilterConfig"
import { ListingsWithFilters } from "@/components/gpu/ListingsWithFilters"
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
  benchmarkValues?: Record<string, number>
}

interface PriceCompareWithFiltersProps {
  listings: ListingItemWithMetric[]
  metricInfo: MetricInfo
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
  // This component serves as the client/server boundary.
  // The parent page.tsx is a server component that fetches data from the database.
  // This wrapper is a client component that enables interactive filtering.
  return (
    <ListingsWithFilters
      listings={listings}
      getFieldValue={getListingFieldValue}
      filterTitle="Filter Listings"
      gamingBenchmarks={gamingBenchmarks}
      currentMetricSlug={metricInfo.slug}
    >
      {(filteredListings) => (
        <ListingGalleryWithMetric
          listings={filteredListings}
          metricInfo={metricInfo}
        />
      )}
    </ListingsWithFilters>
  )
}
