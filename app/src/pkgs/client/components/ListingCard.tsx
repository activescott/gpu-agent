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
        <ListingAffiliateLink
          to={itemAffiliateWebUrl}
          listing={item}
          className="text-decoration-none text-reset text underline-on-hover"
        >
          <Image
            src={imageUrl}
            className="card-img-top mx-auto mt-1"
            alt={title}
            width={215}
            height={215}
          />
        </ListingAffiliateLink>
      </div>
      <div className="card-body">
        <h5 className="card-title">
          <ListingAffiliateLink
            to={itemAffiliateWebUrl}
            listing={item}
            className="text-decoration-none text-reset text underline-on-hover"
          >
            {title}
          </ListingAffiliateLink>
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
              {formatPrice(divideSafe(cost, specs[specKey]))} /{" "}
              {GpuSpecsDescription[specKey].unit}
            </SpecPill>
          ))}
        </div>
      </div>
      <div className="card-footer d-flex">
        <ListingAffiliateLink
          to={itemAffiliateWebUrl}
          listing={item}
          className="btn btn-primary my-1 me-auto"
        >
          Buy Now
        </ListingAffiliateLink>
        <SvgIcon icon="ebay" className="" />
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
