import { SvgIcon } from "@/pkgs/client/components/SvgIcon"
import { SpecPill } from "@/pkgs/client/components/SpecPill"
import { AttributePill } from "./AttributePill"
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

const formatPrice = (price: number) => {
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
  const { itemAffiliateWebUrl, priceValue, title, condition } = item
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
        <Image
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
          onClick={() => trackBuyNowEvent(analytics, item)}
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

const trackBuyNowEvent = (
  analytics: AnalyticsReporter,
  item: Listing,
): void => {
  analytics.trackAction(AnalyticsActions.BuyNow, {
    "listing-id": item.itemId,
    "gpu-name": item.gpu.name,
    "listing-price": item.priceValue,
  })
}

function chooseBestImageUrl(item: Listing): string {
  // thumbnailImages is conditional, but usually the same image as image, but smaller.
  if (item.thumbnailImageUrl) {
    return item.thumbnailImageUrl
  }
  return item.imageUrl
}
