"use client"
import { SpecPill } from "@/pkgs/client/components/SpecPill"
import { AttributePill, CountryPill } from "./AttributePill"
import {
  Gpu,
  GpuMetricKey,
  GpuMetricsDescription,
  Listing,
  ListingWithMetric,
} from "@/pkgs/isomorphic/model"
import { getMetricCategory } from "@/pkgs/isomorphic/model/metrics"
import Image from "next/image"
import { divideSafe } from "@/pkgs/isomorphic/math"
import type { MetricInfo } from "./ListingGalleryWithMetric"
import { AmazonPriceDisclaimer } from "./AmazonPriceDisclaimer"
import { formatPrice } from "./format"
import { BuyNowButton } from "./BuyNowButton"

const fmtCostPerMetric = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatCostPerMetric = (price: number) => {
  return fmtCostPerMetric.format(price)
}

/** For price-compare pages where metric value comes from the ListingWithMetric query */
interface MetricInfoProps {
  item: Listing | ListingWithMetric
  metricInfo?: MetricInfo
  specs?: never
  highlightSpec?: never
}

/** For shop pages where metric value is derived from GPU specs */
interface SpecsProps {
  item: Listing
  specs: Gpu
  highlightSpec: GpuMetricKey
  metricInfo?: never
}

type ListingCardWithMetricProps = MetricInfoProps | SpecsProps

interface MetricDisplayProps {
  metricInfo: MetricInfo
  costPerMetric: number
  metricValue: number
}

function MetricDisplay({
  metricInfo,
  costPerMetric,
  metricValue,
}: MetricDisplayProps) {
  return (
    <SpecPill
      infoTipText={
        metricInfo.descriptionDollarsPer ?? `Cost per ${metricInfo.unit}`
      }
      color="primary"
    >
      {formatCostPerMetric(costPerMetric)} / {metricInfo.unit}
      {metricInfo.category === "gaming" && metricValue && (
        <span className="ms-1 fw-lighter fst-italic">
          @{Math.round(metricValue)} {metricInfo.unitShortest}
        </span>
      )}
    </SpecPill>
  )
}

interface GpuInfoDisplayProps {
  gpuName: string
  memoryCapacityGB: number | null
}

function GpuInfoDisplay({ gpuName, memoryCapacityGB }: GpuInfoDisplayProps) {
  return (
    <>
      <span className="badge bg-secondary me-1">{gpuName}</span>
      {memoryCapacityGB && (
        <span className="badge bg-light text-dark me-1">
          {memoryCapacityGB} GB
        </span>
      )}
    </>
  )
}

function resolveMetricData(
  props: ListingCardWithMetricProps,
  cost: number,
): {
  metricInfo: MetricInfo
  metricValue: number
  costPerMetric: number
} | null {
  if (props.specs) {
    const desc = GpuMetricsDescription[props.highlightSpec]
    const metricValue = props.specs[props.highlightSpec]
    if (metricValue == null) return null
    return {
      metricInfo: {
        slug: props.highlightSpec,
        name: desc.label,
        category: getMetricCategory(props.highlightSpec),
        unit: desc.unit,
        unitShortest: desc.unitShortest,
        descriptionDollarsPer: desc.descriptionDollarsPer,
      },
      metricValue,
      costPerMetric: divideSafe(cost, metricValue),
    }
  }

  if (props.metricInfo) {
    const metricValue =
      "metricValue" in props.item ? props.item.metricValue : undefined
    if (metricValue == null) return null
    return {
      metricInfo: props.metricInfo,
      metricValue,
      costPerMetric: divideSafe(cost, metricValue),
    }
  }

  return null
}

/**
 * A listing card component that displays a listing with optional metric value.
 * Accepts either specs + highlightSpec (for shop pages) or metricInfo (for price-compare pages).
 * When no metric can be resolved, shows GPU name and memory instead.
 */
export function ListingCardWithMetric(props: ListingCardWithMetricProps) {
  const {
    item: {
      priceValue,
      title,
      condition,
      itemLocationCountry,
      gpu,
      source,
      cachedAt,
    },
    item,
  } = props

  const imageUrl = chooseBestImageUrl(item)
  const cost = Number(priceValue)
  const resolved = resolveMetricData(props, cost)

  return (
    <div className="card m-1" style={{ width: "18rem" }}>
      <div
        style={{
          height: "215px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* NOTE: unoptimized because these are external eBay thumbnails that are already optimized by eBay's CDN */}
        {imageUrl && (
          <Image
            unoptimized
            src={imageUrl}
            className="card-img-top mx-auto mt-1 object-fit-contain"
            alt={title}
            width={215}
            height={215}
          />
        )}
      </div>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <div className="card-text">
          <AttributePill>{formatPrice(cost)}</AttributePill>
          {condition && <AttributePill>{condition}</AttributePill>}
          {itemLocationCountry && (
            <CountryPill isoCountryCode={itemLocationCountry}></CountryPill>
          )}
          <br />
          {resolved ? (
            <MetricDisplay
              metricInfo={resolved.metricInfo}
              costPerMetric={resolved.costPerMetric}
              metricValue={resolved.metricValue}
            />
          ) : (
            <GpuInfoDisplay
              gpuName={gpu.name}
              memoryCapacityGB={gpu.memoryCapacityGB}
            />
          )}
          <AmazonPriceDisclaimer source={source} cachedAt={cachedAt} />
        </div>
      </div>
      <div className="card-footer d-flex">
        <BuyNowButton item={item} />
      </div>
    </div>
  )
}

export function chooseBestImageUrl(item: Listing | ListingWithMetric): string {
  if (item.thumbnailImageUrl) {
    return item.thumbnailImageUrl
  }
  return item.imageUrl
}
