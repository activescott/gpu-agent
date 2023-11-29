"use client"
import { useSorting } from "@/pkgs/client/components/SortPanel"
import { ItemSummary } from "ebay-client"
import { GpuSpecKey, GpuSpecs } from "../../isomorphic/model/specs"
import { ListingCard } from "./ListingCard"
import { useState } from "react"
import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:ListingGallery")

interface ListingItem {
  specs: GpuSpecs
  item: ItemSummary
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
          item={{
            itemId: item.itemId,
            itemUrl: item.itemAffiliateWebUrl!,
            priceValue: item.price.value,
            title: item.title,
            imageUrl: proxyImageUrl(chooseBestImageUrl(item)),
            condition: item.condition,
          }}
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
    const aValue = Number(a.item.price.value) / a.specs[specKey]
    const bValue = Number(b.item.price.value) / b.specs[specKey]
    return ascending ? aValue - bValue : bValue - aValue
  })
  return sorted
}

function chooseBestImageUrl(item: ItemSummary): string {
  // thumbnailImages is conditional, but usually the same image as image, but smaller.
  if (item.thumbnailImages && item.thumbnailImages.length > 0) {
    return item.thumbnailImages[0].imageUrl
  }
  return item.image.imageUrl
}

function proxyImageUrl(imageUrl: string): string {
  const EBAY_IMAGE_PROXY_PATH = "/ei/"
  const EBAY_IMAGE_HOST = /^https:\/\/i.ebayimg.com\//
  return imageUrl.replace(EBAY_IMAGE_HOST, EBAY_IMAGE_PROXY_PATH)
}
