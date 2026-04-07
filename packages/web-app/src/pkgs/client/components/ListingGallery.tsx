"use client"
import { useSorting, type SortKey } from "@/pkgs/client/components/SortPanel"
import { Gpu, Listing } from "../../isomorphic/model"
import { ListingCardWithMetric } from "./ListingCardWithMetric"
import { useMemo, type JSX } from "react"
import { divideSafe } from "@/pkgs/isomorphic/math"
import { createClientLogger } from "@/lib/clientLogger"

const log = createClientLogger("components:ListingGallery")

interface ListingItem {
  specs: Gpu
  item: Listing
}

interface ListingGalleryProps {
  listings: ListingItem[]
  hideSort?: boolean
  initialSortKey: SortKey
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
        <ListingCardWithMetric
          key={`${item.itemId}-${index.toString()}`}
          item={item}
          specs={specs}
          highlightSpec={
            sortValue.metricKey === "price" ? "fp32TFLOPS" : sortValue.metricKey
          }
        />
      ))}
    </div>
  )
}

interface SortValue {
  metricKey: SortKey
  ascending: boolean
}

function sortListings(listings: ListingItem[], sortValue: SortValue) {
  const sorted = listings.sort((a, b) => {
    const { metricKey, ascending } = sortValue
    let aValue: number
    let bValue: number
    if (metricKey === "price") {
      aValue = Number.parseFloat(a.item.priceValue)
      bValue = Number.parseFloat(b.item.priceValue)
    } else {
      aValue = divideSafe(
        Number.parseFloat(a.item.priceValue),
        a.specs[metricKey],
      )
      bValue = divideSafe(
        Number.parseFloat(b.item.priceValue),
        b.specs[metricKey],
      )
    }
    return ascending ? aValue - bValue : bValue - aValue
  })
  return sorted
}
