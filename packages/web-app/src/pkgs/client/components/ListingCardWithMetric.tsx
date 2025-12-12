"use client"
import { SvgIcon } from "@/pkgs/client/components/SvgIcon"
import { SpecPill } from "@/pkgs/client/components/SpecPill"
import { AttributePill, CountryPill } from "./AttributePill"
import { ListingWithMetric } from "@/pkgs/isomorphic/model"
import Image from "next/image"
import { ListingAffiliateLink } from "./ListingAffiliateLink"
import { divideSafe } from "@/pkgs/isomorphic/math"
import type { MetricInfo } from "./ListingGalleryWithMetric"

const fmtInteger = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
const fmtDecimal = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})
const fmtCostPerMetric = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatPrice = (price: number) => {
  if (price < 1) return fmtDecimal.format(price)
  return fmtInteger.format(price)
}

const formatCostPerMetric = (price: number) => {
  return fmtCostPerMetric.format(price)
}

interface ListingCardWithMetricProps {
  item: ListingWithMetric
  metricInfo: MetricInfo
}

/**
 * A listing card component that displays a listing with a dynamic metric value.
 * Unlike ListingCard which uses hardcoded GpuMetricKey, this component accepts
 * metric information from the database and uses the metricValue from ListingWithMetric.
 */
export const ListingCardWithMetric = ({
  item,
  metricInfo,
}: ListingCardWithMetricProps) => {
  const {
    itemAffiliateWebUrl,
    priceValue,
    title,
    condition,
    itemLocationCountry,
    metricValue,
  } = item

  const imageUrl = chooseBestImageUrl(item)
  const cost = Number(priceValue)

  const costPerMetric = divideSafe(cost, metricValue)

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
        <Image
          unoptimized
          src={imageUrl}
          className="card-img-top mx-auto mt-1 object-fit-contain"
          alt={title}
          width={215}
          height={215}
        />
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
        </div>
      </div>
      <div className="card-footer d-flex">
        <ListingAffiliateLink
          to={itemAffiliateWebUrl}
          listing={item}
          className="btn btn-primary my-1 me-auto"
        >
          Buy &nbsp;
          <span className="fs-small fw-lighter">
            @ <SvgIcon icon="ebay" />
          </span>
        </ListingAffiliateLink>
      </div>
    </div>
  )
}

function chooseBestImageUrl(item: ListingWithMetric): string {
  // thumbnailImages is conditional, but usually the same image as image, but smaller.
  if (item.thumbnailImageUrl) {
    return item.thumbnailImageUrl
  }
  return item.imageUrl
}
