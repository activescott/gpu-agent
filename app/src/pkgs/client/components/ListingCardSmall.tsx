"use client"
import { Listing } from "@/pkgs/isomorphic/model"
import {
  GpuSpecKey,
  GpuSpecs,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import { useAnalytics } from "../analytics/reporter"
import {
  chooseBestImageUrl,
  formatPrice,
  trackBuyNowEvent,
} from "./ListingCard"
import Image from "next/image"
import { AttributePill, CountryPill } from "./AttributePill"
import { SpecPill } from "./SpecPill"
import Link from "next/link"

interface ListingCardProps {
  item: Listing
  specs: GpuSpecs
  highlightSpec: GpuSpecKey
}

export function ListingCardSmall({
  item,
  specs,
  highlightSpec,
}: ListingCardProps): JSX.Element {
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
    <div className="card mb-3" style={{ maxWidth: "540px" }}>
      <div className="row g-0">
        <div className="col-md-4">
          <Link
            href={itemAffiliateWebUrl}
            onClick={() => {
              trackBuyNowEvent(analytics, item, "listing-image")
            }}
          >
            <Image
              src={imageUrl}
              className="card-img-top mx-auto mt-1"
              alt={title}
              width={128}
              height={128}
            />
          </Link>
        </div>
        <div className="col-md-8">
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
            <div className="card-text text-align-start">
              <AttributePill>{formatPrice(cost)}</AttributePill>
              {condition && <AttributePill>{condition}</AttributePill>}
              {itemLocationCountry && (
                <CountryPill isoCountryCode={itemLocationCountry}></CountryPill>
              )}
              <SpecPill
                key={highlightSpec}
                infoTipText={
                  GpuSpecsDescription[highlightSpec].descriptionDollarsPer
                }
                color={
                  highlightSpec === highlightSpec ? "primary" : "secondary"
                }
              >
                {formatPrice(cost / specs[highlightSpec])} /{" "}
                {GpuSpecsDescription[highlightSpec].unit}
              </SpecPill>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
