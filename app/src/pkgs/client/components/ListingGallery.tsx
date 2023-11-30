"use client"
import { useSorting } from "@/pkgs/client/components/SortPanel"
import { GpuSpecKey, GpuSpecs } from "../../isomorphic/model/specs"
import { ListingCard } from "./ListingCard"
import { useState } from "react"
import { createDiag } from "@activescott/diag"
import { Listing } from "@/pkgs/isomorphic/model"

const log = createDiag("shopping-agent:ListingGallery")

interface ListingItem {
  specs: GpuSpecs
  item: Listing
}

interface ListingGalleryProps {
  listings: ListingItem[]
}

export function ListingGallery({ listings }: ListingGalleryProps): JSX.Element {
  const initialSort = {
    specKey: "fp32TFLOPS" as GpuSpecKey,
    ascending: true,
  }

  const [sortedListings, setSortedListings] = useState<ListingItem[]>(() => {
    return sortListings(listings, initialSort)
  })

  const { sortPanel } = useSorting(initialSort, (sortValue) => {
    log.debug(
      "sorting change: sorting by %s %s",
      sortValue.specKey,
      sortValue.ascending,
    )
    setSortedListings(sortListings(listings, sortValue))
  })

  return (
    <div id="listingContainer" className="d-flex flex-wrap">
      {sortPanel}
      {sortedListings.map(({ item, specs }, index) => (
        <ListingCard
          key={`${item.itemId}-${index.toString()}`}
          item={item}
          specs={specs}
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
    const aValue = Number.parseFloat(a.item.priceValue) / a.specs[specKey]
    const bValue = Number.parseFloat(b.item.priceValue) / b.specs[specKey]
    return ascending ? aValue - bValue : bValue - aValue
  })
  return sorted
}
