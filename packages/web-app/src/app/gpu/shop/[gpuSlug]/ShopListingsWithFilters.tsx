"use client"

import type { JSX } from "react"
import { getShopListingFieldValue } from "@/components/gpu/gpuFilterConfig"
import { ListingsWithFilters } from "@/components/gpu/ListingsWithFilters"
import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import type { Gpu, Listing, GpuMetricKey } from "@/pkgs/isomorphic/model"

interface ListingItem {
  specs: Gpu
  item: Listing
}

interface ShopListingsWithFiltersProps {
  listings: ListingItem[]
  initialSortKey: GpuMetricKey
}

/**
 * Client component wrapper that adds filtering to the shop page
 * Only includes Budget, Condition, and Country filters (spec filters are irrelevant
 * since all listings are for the same GPU)
 */
export function ShopListingsWithFilters({
  listings,
  initialSortKey,
}: ShopListingsWithFiltersProps): JSX.Element {
  // This component serves as the client/server boundary.
  // The parent page.tsx is a server component that fetches data from the database.
  // This wrapper is a client component that enables interactive filtering.
  return (
    <ListingsWithFilters
      listings={listings}
      getFieldValue={getShopListingFieldValue}
      filterTitle="Filter Listings"
      includeSpecFilters={false}
    >
      {(filteredListings) => (
        <ListingGallery
          key={filteredListings.length}
          listings={filteredListings}
          initialSortKey={initialSortKey}
        />
      )}
    </ListingsWithFilters>
  )
}
