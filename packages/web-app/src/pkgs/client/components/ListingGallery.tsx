"use client"
import { useSorting } from "@/pkgs/client/components/SortPanel"
import { GpuMetricKey, Gpu, Listing } from "../../isomorphic/model"
import { ListingCard } from "./ListingCard"
import { useMemo, type JSX } from "react"
import { createDiag } from "@activescott/diag"
import { divideSafe } from "@/pkgs/isomorphic/math"

const log = createDiag("shopping-agent:ListingGallery")

interface ListingItem {
  specs: Gpu
  item: Listing
}

interface ListingGalleryProps {
  listings: ListingItem[]
  hideSort?: boolean
  initialSortKey: GpuMetricKey
}

export function ListingGallery({
  listings,
  hideSort = false,
  initialSortKey,
}: ListingGalleryProps): JSX.Element {
  const initialSort = {
    metricKey: initialSortKey,
    ascending: true,
  }

  const { sortPanel, sortValue } = useSorting(initialSort, (newSortValue) => {
    log.debug(
      "sorting change: sorting by %s %s",
      newSortValue.metricKey,
      newSortValue.ascending,
    )
  })

  // Derive sorted listings from props - recalculates when listings or sort changes
  const sortedListings = useMemo(
    () => sortListings([...listings], sortValue),
    [listings, sortValue],
  )

  return (
    <div id="listingContainer" className="d-flex flex-wrap">
      {hideSort == false && sortPanel}
      {sortedListings.map(({ item, specs }, index) => (
        <ListingCard
          key={`${item.itemId}-${index.toString()}`}
          item={item}
          specs={specs}
          highlightSpec={sortValue.metricKey}
        />
      ))}
    </div>
  )
}

interface SortValue {
  metricKey: GpuMetricKey
  ascending: boolean
}

function sortListings(listings: ListingItem[], sortValue: SortValue) {
  const sorted = listings.sort((a, b) => {
    const { metricKey, ascending } = sortValue
    const aValue = divideSafe(
      Number.parseFloat(a.item.priceValue),
      a.specs[metricKey],
    )
    const bValue = divideSafe(
      Number.parseFloat(b.item.priceValue),
      b.specs[metricKey],
    )
    return ascending ? aValue - bValue : bValue - aValue
  })
  return sorted
}
