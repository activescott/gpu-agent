"use client"
import { useSortPanel } from "@/pkgs/client/components/SortPanel"
import { ItemSummary } from "ebay-client"
import { GpuSpecKey, GpuSpecs } from "../../isomorphic/specs"
import { ListingCard } from "./ListingCard"
import { useState } from "react"

interface ListingItem {
  specs: GpuSpecs
  item: ItemSummary
}

interface ListingGalleryProps {
  listings: ListingItem[]
}

interface SortValue {
  specKey: GpuSpecKey
  ascending: boolean
}

export function ListingGallery({ listings }: ListingGalleryProps): JSX.Element {
  const [sortValue, setSortValue] = useState<SortValue>({
    specKey: "fp32TFLOPS",
    ascending: true,
  })
  const { sortComponent } = useSortPanel(sortValue, setSortValue)

  listings.sort((a, b) => {
    const { specKey, ascending } = sortValue
    const aValue = Number(a.item.price.value) / a.specs[specKey]
    const bValue = Number(b.item.price.value) / b.specs[specKey]
    return ascending ? aValue - bValue : bValue - aValue
  })

  return (
    <div id="listingContainer" className="d-flex flex-wrap">
      {sortComponent}
      {listings.map(({ item, specs }) => (
        <ListingCard
          key={item.itemId}
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
