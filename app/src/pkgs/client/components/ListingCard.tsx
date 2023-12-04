"use client"
import { SvgIcon } from "@/pkgs/client/components/SvgIcon"
import { SpecPill } from "@/pkgs/client/components/SpecPill"
import { AttributePill, CountryPill } from "./AttributePill"
import {
  GpuSpecKey,
  GpuSpecKeys,
  GpuSpecs,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import { Listing } from "@/pkgs/isomorphic/model"
import Image from "next/image"
import {
  AnalyticsActions,
  AnalyticsReporter,
  useAnalytics,
} from "../analytics/reporter"
import Link from "next/link"

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

export const formatPrice = (price: number) => {
  if (price < 1) return fmtDecimal.format(price)
  return fmtInteger.format(price)
}

interface ListingCardProps {
  item: Listing
  specs: GpuSpecs
  highlightSpec: GpuSpecKey
}

export const ListingCard = ({
  item,
  specs,
  highlightSpec,
}: ListingCardProps) => {
  const analytics = useAnalytics()
  const {
    itemAffiliateWebUrl,
    priceValue,
    title,
    condition,
    itemLocationCountry,
  } = item

  const imageUrl = chooseBestImageUrl(item)
  const cost = Number(priceValue)
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
        <Link
          href={itemAffiliateWebUrl}
          onClick={() => {
            trackBuyNowEvent(analytics, item, "listing-image")
          }}
          className="text-decoration-none text-reset text underline-on-hover"
        >
          <Image
            src={imageUrl}
            className="card-img-top mx-auto mt-1"
            alt={title}
            width={215}
            height={215}
          />
        </Link>
      </div>
      <div className="card-body">
        <h5 className="card-title">
          <Link
            href={itemAffiliateWebUrl}
            onClick={() => {
              trackBuyNowEvent(analytics, item, "listing-title")
            }}
            className="text-decoration-none text-reset text underline-on-hover"
          >
            {title}
          </Link>
        </h5>
        <div className="card-text">
          <AttributePill>{formatPrice(cost)}</AttributePill>
          {condition && <AttributePill>{condition}</AttributePill>}
          {itemLocationCountry && (
            <CountryPill isoCountryCode={itemLocationCountry}></CountryPill>
          )}
          <br />
          {GpuSpecKeys.map((specKey) => (
            <SpecPill
              key={specKey}
              infoTipText={GpuSpecsDescription[specKey].descriptionDollarsPer}
              color={specKey === highlightSpec ? "primary" : "secondary"}
            >
              {formatPrice(cost / specs[specKey])} /{" "}
              {GpuSpecsDescription[specKey].unit}
            </SpecPill>
          ))}
        </div>
      </div>
      <div className="card-footer d-flex">
        <a
          href={itemAffiliateWebUrl}
          onClick={() => trackBuyNowEvent(analytics, item, "buy-button")}
          className="btn btn-primary my-1 me-auto"
          target="_blank"
          rel="noreferrer"
        >
          Buy Now
        </a>
        <SvgIcon icon="ebay" className="" />
      </div>
    </div>
  )
}

export const trackBuyNowEvent = (
  analytics: AnalyticsReporter,
  item: Listing,
  clickType: "listing-title" | "buy-button" | "listing-image",
): void => {
  analytics.trackAction(AnalyticsActions.BuyNow, {
    "listing-id": item.itemId,
    "gpu-name": item.gpu.name,
    "listing-price": item.priceValue,
    "click-type": clickType,
  })
}

export function chooseBestImageUrl(item: Listing): string {
  // thumbnailImages is conditional, but usually the same image as image, but smaller.
  if (item.thumbnailImageUrl) {
    return item.thumbnailImageUrl
  }
  return item.imageUrl
}
