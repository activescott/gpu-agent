"use client"
import { Listing } from "@/pkgs/isomorphic/model"
import {
  GpuSpecKey,
  GpuSpecs,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import { chooseBestImageUrl, formatPrice } from "./ListingCard"
import Image from "next/image"
import { AttributePill, CountryPill } from "./AttributePill"
import { SpecPill } from "./SpecPill"
import { ListingAffiliateLink } from "./ListingAffiliateLink"
import { divideSafe } from "@/pkgs/isomorphic/math"
import { SvgIcon } from "./SvgIcon"

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
  const {
    priceValue,
    title,
    condition,
    itemLocationCountry,
    itemAffiliateWebUrl,
  } = item
  const imageUrl = chooseBestImageUrl(item)
  const cost = Number(priceValue)

  return (
    <div
      className="card mb-3 d-inline-block mx-2"
      style={{ maxWidth: "540px" }}
    >
      <div className="row g-0">
        <div className="col-md-4">
          {/* NOTE: unoptimized because this is eating through optimizations of vercel. see https://vercel.com/docs/image-optimization/managing-image-optimization-costs */}
          <Image
            unoptimized
            src={imageUrl}
            className="card-img-top mx-auto mt-1"
            alt={title}
            width={128}
            height={128}
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5
              className="card-title"
              style={{
                minHeight: "3lh",
                maxHeight: "3lh",
                overflow: "clip",
              }}
            >
              {title}
            </h5>
            <div className="card-text text-align-start">
              <ListingAffiliateLink to={itemAffiliateWebUrl} listing={item}>
                <AttributePill className="underline-on-hover">
                  {formatPrice(cost)} <span className="fw-lighter">@</span>{" "}
                  <SvgIcon icon="ebay" size="xs" />
                </AttributePill>
              </ListingAffiliateLink>
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
                {formatPrice(divideSafe(cost, specs[highlightSpec]))} /{" "}
                {GpuSpecsDescription[highlightSpec].unit}
              </SpecPill>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
