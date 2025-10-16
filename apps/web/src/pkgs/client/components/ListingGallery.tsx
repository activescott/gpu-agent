"use client"
import { useSorting } from "@/pkgs/client/components/SortPanel"
import { GpuSpecKey, GpuSpecs } from "../../isomorphic/model/specs"
import { ListingCard } from "./ListingCard"
import { useState, type JSX } from "react"
import { createDiag } from "@activescott/diag"
import { Listing } from "@/pkgs/isomorphic/model"
import { divideSafe } from "@/pkgs/isomorphic/math"

const log = createDiag("shopping-agent:ListingGallery")

interface ListingItem {
  specs: GpuSpecs
  item: Listing
}

interface ListingGalleryProps {
  listings: ListingItem[]
  hideSort?: boolean
  initialSortKey: GpuSpecKey
}

export function ListingGallery({
  listings,
  hideSort = false,
  initialSortKey,
}: ListingGalleryProps): JSX.Element {
  const initialSort = {
    specKey: initialSortKey,
    ascending: true,
  }

  const [sortedListings, setSortedListings] = useState<ListingItem[]>(() => {
    return sortListings(listings, initialSort)
  })

  const { sortPanel, sortValue } = useSorting(initialSort, (sortValue) => {
    log.debug(
      "sorting change: sorting by %s %s",
      sortValue.specKey,
      sortValue.ascending,
    )
    setSortedListings(sortListings(listings, sortValue))
  })

  return (
    <div id="listingContainer" className="d-flex flex-wrap">
      {hideSort == false && sortPanel}
      {sortedListings.map(({ item, specs }, index) => (
        <ListingCard
          key={`${item.itemId}-${index.toString()}`}
          item={item}
          specs={specs}
          highlightSpec={sortValue.specKey}
        />
      ))}
    </div>
  )
}

interface SortValue {
  specKey: GpuSpecKey
  ascending: boolean
}

function sortListings(listings: ListingItem[], sortValue: SortValue) {
  const sorted = listings.sort((a, b) => {
    const { specKey, ascending } = sortValue
    const aValue = divideSafe(
      Number.parseFloat(a.item.priceValue),
      a.specs[specKey],
    )
    const bValue = divideSafe(
      Number.parseFloat(b.item.priceValue),
      b.specs[specKey],
    )
    return ascending ? aValue - bValue : bValue - aValue
  })
  return sorted
}
