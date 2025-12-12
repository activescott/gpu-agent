"use client"
import { ListingWithMetric } from "../../isomorphic/model"
import { ListingCardWithMetric } from "./ListingCardWithMetric"
import { type JSX } from "react"

export interface MetricInfo {
  slug: string
  name: string
  category: "ai" | "gaming"
  unit: string
  unitShortest: string
  descriptionDollarsPer: string | null
}

interface ListingItemWithMetric {
  item: ListingWithMetric
}

interface ListingGalleryWithMetricProps {
  listings: ListingItemWithMetric[]
  metricInfo: MetricInfo
}

/**
 * A listing gallery component that displays listings with dynamic metric values.
 * Unlike ListingGallery which uses hardcoded GpuMetricKey, this component accepts
 * metric information from the database and uses the metricValue from ListingWithMetric.
 */
export function ListingGalleryWithMetric({
  listings,
  metricInfo,
}: ListingGalleryWithMetricProps): JSX.Element {
  return (
    <div id="listingContainer" className="d-flex flex-wrap">
      {listings.map(({ item }, index) => (
        <ListingCardWithMetric
          key={`${item.itemId}-${index.toString()}`}
          item={item}
          metricInfo={metricInfo}
        />
      ))}
    </div>
  )
}
