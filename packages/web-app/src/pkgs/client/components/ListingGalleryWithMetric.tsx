"use client"
import { Listing, ListingWithMetric } from "../../isomorphic/model"
import { ListingCardWithMetric } from "./ListingCardWithMetric"
import { BootstrapIcon } from "./BootstrapIcon"
import { useState, useMemo, useCallback, type JSX } from "react"

export interface MetricInfo {
  slug: string
  name: string
  category: "ai" | "gaming"
  unit: string
  unitShortest: string
  descriptionDollarsPer: string | null
}

type PriceCompareSortField = "price" | "dollarsPer"
type SortDirection = "asc" | "desc"

interface ListingItem {
  item: Listing | ListingWithMetric
}

interface ListingGalleryWithMetricProps {
  listings: ListingItem[]
  /** When provided, shows cost-per-metric. When omitted, shows GPU info. */
  metricInfo?: MetricInfo
}

function hasMetricValue(
  item: Listing | ListingWithMetric,
): item is ListingWithMetric {
  return "metricValue" in item && typeof item.metricValue === "number"
}

function getSortValue(
  item: Listing | ListingWithMetric,
  field: PriceCompareSortField,
): number {
  const price = Number.parseFloat(item.priceValue)
  if (field === "price") return price
  if (hasMetricValue(item) && item.metricValue > 0) {
    return price / item.metricValue
  }
  return Number.MAX_VALUE
}

function sortListings(
  listings: ListingItem[],
  field: PriceCompareSortField,
  direction: SortDirection,
): ListingItem[] {
  return [...listings].sort((a, b) => {
    const aVal = getSortValue(a.item, field)
    const bVal = getSortValue(b.item, field)
    return direction === "asc" ? aVal - bVal : bVal - aVal
  })
}

export function ListingGalleryWithMetric({
  listings,
  metricInfo,
}: ListingGalleryWithMetricProps): JSX.Element {
  const [sortField, setSortField] = useState<PriceCompareSortField>("price")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const sortedListings = useMemo(
    () => sortListings(listings, sortField, sortDirection),
    [listings, sortField, sortDirection],
  )

  const handleSortFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      if (value === "price" || value === "dollarsPer") {
        setSortField(value)
      }
    },
    [],
  )

  const toggleDirection = useCallback(() => {
    setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
  }, [])

  return (
    <>
      <div className="w-100 mb-3">
        <div className="border rounded py-2 px-3 d-flex align-items-center">
          <label
            htmlFor="sort-field"
            className="d-block form-label text-nowrap me-2 mb-0"
          >
            Sort by
          </label>
          <select
            id="sort-field"
            className="form-select form-select-sm me-2"
            value={sortField}
            onChange={handleSortFieldChange}
          >
            <option value="price">Price</option>
            {metricInfo && (
              <option value="dollarsPer">
                $ per {metricInfo.unitShortest}
              </option>
            )}
          </select>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={toggleDirection}
            aria-label={
              sortDirection === "asc" ? "Sort ascending" : "Sort descending"
            }
          >
            <BootstrapIcon
              icon={sortDirection === "asc" ? "sort-up" : "sort-down"}
              size="xs"
            />
          </button>
        </div>
      </div>
      <div id="listingContainer" className="d-flex flex-wrap">
        {sortedListings.map(({ item }, index) => (
          <ListingCardWithMetric
            key={`${item.itemId}-${index.toString()}`}
            item={item}
            metricInfo={metricInfo}
          />
        ))}
      </div>
    </>
  )
}
