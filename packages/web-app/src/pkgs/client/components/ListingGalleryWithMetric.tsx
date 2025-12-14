"use client"
import { Listing, ListingWithMetric } from "../../isomorphic/model"
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

interface ListingItem {
  item: Listing | ListingWithMetric
}

interface ListingGalleryWithMetricProps {
  listings: ListingItem[]
  /** When provided, shows cost-per-metric. When omitted, shows GPU info. */
  metricInfo?: MetricInfo
}

/**
 * A listing gallery component that displays listings with optional metric values.
 * When metricInfo is provided, shows cost-per-metric on cards.
 * When omitted, shows GPU name and memory instead.
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
