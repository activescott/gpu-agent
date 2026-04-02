"use client"
import { Listing, ListingWithMetric } from "@/pkgs/isomorphic/model"
import {
  GpuSpecKey,
  GpuSpecs,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import { chooseBestImageUrl, formatPrice } from "./ListingCardWithMetric"
import Image from "next/image"
import { AttributePill, CountryPill } from "./AttributePill"
import { SpecPill } from "./SpecPill"
import { ListingAffiliateLink } from "./ListingAffiliateLink"
import { divideSafe } from "@/pkgs/isomorphic/math"
import { MarketplaceIcon } from "./MarketplaceIcon"
import { AmazonPriceDisclaimer } from "./AmazonPriceDisclaimer"

import type { JSX } from "react"

export interface SmallCardMetricInfo {
  unit: string
  descriptionDollarsPer: string
}

interface SpecBasedProps {
  item: Listing
  specs: GpuSpecs
  highlightSpec: GpuSpecKey
  metricInfo?: never
  metricValue?: never
}

interface MetricBasedProps {
  item: ListingWithMetric
  metricInfo: SmallCardMetricInfo
  metricValue: number
  specs?: never
  highlightSpec?: never
}

type ListingCardProps = SpecBasedProps | MetricBasedProps

function resolveMetric(
  props: ListingCardProps,
  cost: number,
): { costPerMetric: number; unit: string; tooltip: string } {
  if (props.metricInfo) {
    return {
      costPerMetric: divideSafe(cost, props.metricValue),
      unit: props.metricInfo.unit,
      tooltip: props.metricInfo.descriptionDollarsPer,
    }
  }
  const { specs, highlightSpec } = props
  return {
    costPerMetric: divideSafe(cost, specs[highlightSpec]),
    unit: GpuSpecsDescription[highlightSpec].unit,
    tooltip: GpuSpecsDescription[highlightSpec].descriptionDollarsPer,
  }
}

export function ListingCardSmall(props: ListingCardProps): JSX.Element {
  const {
    item: {
      priceValue,
      title,
      condition,
      itemLocationCountry,
      itemAffiliateWebUrl,
      source,
    },
    item,
  } = props
  const imageUrl = chooseBestImageUrl(item)
  const cost = Number(priceValue)
  const { costPerMetric, unit, tooltip } = resolveMetric(props, cost)

  return (
    <div className="card mb-3 d-inline-block mx-2 border-0 shadow max-width-vw-75-xs max-width-vw-25-m">
      <div className="row g-0">
        <div className="col-md-4 d-flex align-items-center p-2">
          {/* NOTE: unoptimized because this is eating through optimizations of vercel. see https://vercel.com/docs/image-optimization/managing-image-optimization-costs */}
          <Image
            unoptimized
            src={imageUrl}
            className="card-img mx-auto mt-1 object-fit-contain"
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
            <div
              className="card-text text-align-start"
              style={{ minHeight: "2lh" }}
            >
              {condition && <AttributePill>{condition}</AttributePill>}
              {itemLocationCountry && (
                <CountryPill isoCountryCode={itemLocationCountry}></CountryPill>
              )}
              <SpecPill infoTipText={tooltip} color="primary" outline>
                {formatPrice(costPerMetric)} / {unit}
              </SpecPill>
            </div>
            <ListingAffiliateLink
              to={itemAffiliateWebUrl}
              listing={item}
              className="btn btn-primary mt-2 d-block gap-1"
            >
              <MarketplaceIcon source={source} size="small" />{" "}
              {formatPrice(cost)}
            </ListingAffiliateLink>
            <AmazonPriceDisclaimer source={source} cachedAt={item.cachedAt} />
          </div>
        </div>
      </div>
    </div>
  )
}
