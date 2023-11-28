import { SvgIcon } from "@/pkgs/client/components/SvgIcon"
import { SpecPill } from "@/pkgs/client/components/SpecPill"
import { Pill } from "./Pill"
import {
  GpuSpecKeys,
  GpuSpecs,
  GpuSpecsDescription,
} from "../../isomorphic/specs"

const formatPriceInteger = (price: number) => {
  // formats to integer /if possible/; otherwise will show decimal as needed
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    maximumSignificantDigits: 1,
  }).format(price)
}

interface ListingCardProps {
  item: {
    itemId: string
    itemUrl: string
    priceValue: string
    title: string
    imageUrl: string
    condition: string | undefined
  }
  specs: GpuSpecs
}

export const ListingCard = ({ item, specs }: ListingCardProps) => {
  const { itemUrl, priceValue, title, imageUrl, condition } = item
  const cost = Number(priceValue)
  return (
    <div className="card m-1" style={{ width: "18rem" }}>
      <img
        src={imageUrl}
        className="card-img-top mx-auto mt-1"
        alt={title}
        style={{ maxWidth: "215px", maxHeight: "215px" }}
      />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <div className="card-text">
          <Pill>{formatPriceInteger(cost)}</Pill>
          {condition && <Pill>{condition}</Pill>}
          {GpuSpecKeys.map((specKey) => (
            <SpecPill
              key={specKey}
              infoTipText={GpuSpecsDescription[specKey].descriptionDollarsPer}
            >
              {formatPriceInteger(cost / specs[specKey])} /{" "}
              {GpuSpecsDescription[specKey].unit}
            </SpecPill>
          ))}
        </div>
        <a
          href={itemUrl}
          className="btn btn-primary btn-sm"
          target="_blank"
          rel="noreferrer"
        >
          Buy Now
        </a>
      </div>
      <div className="card-footer d-flex" style={{ gap: "0.5em" }}>
        <SvgIcon icon="ebay" className="me-auto" />
      </div>
    </div>
  )
}
