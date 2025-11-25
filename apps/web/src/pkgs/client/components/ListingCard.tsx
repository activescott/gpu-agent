"use client"
import { SvgIcon } from "@/pkgs/client/components/SvgIcon"
import { SpecPill } from "@/pkgs/client/components/SpecPill"
import { AttributePill, CountryPill } from "./AttributePill"
import {
  GpuMetricKey,
  GpuMetricsDescription,
  getMetricCategory,
} from "@/pkgs/isomorphic/model/metrics"
import { Listing, Gpu } from "@/pkgs/isomorphic/model"
import Image from "next/image"
import { ListingAffiliateLink } from "./ListingAffiliateLink"
import { divideSafe } from "@/pkgs/isomorphic/math"

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

export const formatPrice = (price: number) => {
  if (price < 1) return fmtDecimal.format(price)
  return fmtInteger.format(price)
}

export const formatCostPerMetric = (price: number) => {
  return fmtCostPerMetric.format(price)
}

interface ListingCardProps {
  item: Listing
  specs: Gpu
  highlightSpec: GpuMetricKey
}

export const ListingCard = ({
  item,
  specs,
  highlightSpec,
}: ListingCardProps) => {
  const category = getMetricCategory(highlightSpec)
  const {
    itemAffiliateWebUrl,
    priceValue,
    title,
    condition,
    itemLocationCountry,
  } = item

  const imageUrl = chooseBestImageUrl(item)
  const cost = Number(priceValue)

  // Show only the primary metric for this page
  const metricValue = specs[highlightSpec]
  const costPerMetric = divideSafe(cost, metricValue)
  const metricDesc = GpuMetricsDescription[highlightSpec]

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
        {/* NOTE: unoptimized because this is eating through optimizations of vercel. see https://vercel.com/docs/image-optimization/managing-image-optimization-costs */}
        <Image
          unoptimized
          src={imageUrl}
          className="card-img-top mx-auto mt-1"
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
            infoTipText={metricDesc.descriptionDollarsPer}
            color="primary"
          >
            {formatCostPerMetric(costPerMetric)} / {metricDesc.unit}
            {category === "gaming" && metricValue && (
              <span className="ms-1 fw-lighter fst-italic">
                @{Math.round(metricValue)} {metricDesc.unitShortest}
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

export function chooseBestImageUrl(item: Listing): string {
  // thumbnailImages is conditional, but usually the same image as image, but smaller.
  if (item.thumbnailImageUrl) {
    return item.thumbnailImageUrl
  }
  return item.imageUrl
}
