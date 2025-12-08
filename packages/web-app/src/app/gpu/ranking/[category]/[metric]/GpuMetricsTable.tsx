"use client"
import { GpuMetricKey } from "@/pkgs/isomorphic/model"
import { FormatCurrency } from "@/pkgs/client/components/FormatCurrency"
import Link from "next/link"
import { useEffect, useState, useMemo, type JSX, Fragment } from "react"
import { composeComparers } from "@/pkgs/isomorphic/collection"
import { dollarsPerMetric } from "@/pkgs/isomorphic/gpuTools"
import { PricedGpu } from "@/pkgs/server/db/GpuRepository"
import { isNil } from "lodash-es"

const PERCENTILE_75 = 0.75
const PERCENTILE_50 = 0.5
const PERCENTILE_25 = 0.25

type TierThreshold = {
  percentile: number
  label: string
}

const TIER_THRESHOLDS: TierThreshold[] = [
  { percentile: PERCENTILE_75, label: "Top Tier - 75th Percentile" },
  { percentile: PERCENTILE_50, label: "Middle Tier - 50th Percentile" },
  { percentile: PERCENTILE_25, label: "Entry Tier - 25th Percentile" },
]

/**
 * Sort GPUs by percentile (descending - highest performance first).
 * GPUs without listings or percentile data are sorted to the bottom.
 */
function sortGpusByPercentile(gpus: PricedGpu[]): PricedGpu[] {
  // GPUs without listings go to bottom
  const listingCountNotZeroComparer = (a: PricedGpu, b: PricedGpu): number => {
    if (a.price.activeListingCount === 0) return 1
    return b.price.activeListingCount === 0 ? -1 : 0
  }

  // GPUs without percentile data go to bottom (among those with listings)
  const hasPercentileComparer = (a: PricedGpu, b: PricedGpu): number => {
    if (a.percentile === undefined) return 1
    return b.percentile === undefined ? -1 : 0
  }

  // Sort by percentile descending (highest performance first)
  const percentileComparer = (a: PricedGpu, b: PricedGpu): number => {
    const aPercentile = a.percentile ?? 0
    const bPercentile = b.percentile ?? 0
    return bPercentile - aPercentile // descending
  }

  return [...gpus].sort(
    composeComparers(
      listingCountNotZeroComparer,
      hasPercentileComparer,
      percentileComparer,
    ),
  )
}

const PERCENT_MULTIPLIER = 100
const DIVISOR_LAST_DIGIT = 10
const DIVISOR_LAST_TWO_DIGITS = 100
// English ordinal suffix rules: 11th, 12th, 13th are exceptions to 1st, 2nd, 3rd
const ORDINAL_EXCEPTION_MIN = 11
const ORDINAL_EXCEPTION_MAX = 13
const ORDINAL_FIRST = 1
const ORDINAL_SECOND = 2
const ORDINAL_THIRD = 3

/**
 * Formats a percentile (0-1) as an ordinal string (e.g., "95th")
 */
function formatPercentileOrdinal(percentile: number): string {
  const percentValue = Math.round(percentile * PERCENT_MULTIPLIER)
  const suffix = getOrdinalSuffix(percentValue)
  return `${percentValue}${suffix}`
}

function getOrdinalSuffix(n: number): string {
  const lastDigit = n % DIVISOR_LAST_DIGIT
  const lastTwoDigits = n % DIVISOR_LAST_TWO_DIGITS
  if (
    lastTwoDigits >= ORDINAL_EXCEPTION_MIN &&
    lastTwoDigits <= ORDINAL_EXCEPTION_MAX
  ) {
    return "th"
  }
  switch (lastDigit) {
    case ORDINAL_FIRST: {
      return "st"
    }
    case ORDINAL_SECOND: {
      return "nd"
    }
    case ORDINAL_THIRD: {
      return "rd"
    }
    default: {
      return "th"
    }
  }
}

/**
 * Calculate cost-per-metric percentiles for all GPUs.
 * Lower cost is better, so we invert the ranking (lowest cost = highest percentile).
 * Returns a Map of GPU name to percentile (0-1).
 */
function calculateCostPercentiles(
  gpus: PricedGpu[],
  metric: GpuMetricKey,
): Map<string, number> {
  // Get valid cost values (GPUs with both listings and metric data)
  const validCosts: { name: string; cost: number }[] = []
  for (const gpu of gpus) {
    const metricValue = gpu.gpu[metric]
    if (
      gpu.price.activeListingCount > 0 &&
      !isNil(metricValue) &&
      metricValue > 0
    ) {
      const cost = dollarsPerMetric(gpu.gpu, gpu.price.minPrice, metric)
      if (Number.isFinite(cost)) {
        validCosts.push({ name: gpu.gpu.name, cost })
      }
    }
  }

  if (validCosts.length === 0) {
    return new Map()
  }

  // Sort by cost ascending (lowest first)
  validCosts.sort((a, b) => a.cost - b.cost)

  // Calculate percentile using CUME_DIST style (inverted since lower is better)
  // Lowest cost gets highest percentile
  const percentileMap = new Map<string, number>()
  for (let i = 0; i < validCosts.length; i++) {
    // Invert: position 0 (lowest cost) should be ~100th percentile
    const percentile = (validCosts.length - i) / validCosts.length
    percentileMap.set(validCosts[i].name, percentile)
  }

  return percentileMap
}

interface GpuMetricsTableProps {
  primaryMetric: GpuMetricKey
  metricUnit: string
  gpusInitial: PricedGpu[]
  /** When set, limits the number of displayed rows */
  maxRows?: number
  /** When false, hides tier dividers. Default: true */
  showTierDividers?: boolean
  /** When provided, renders a header with link above the table */
  header?: { title: string; href: string }
}

export function GpuMetricsTable({
  primaryMetric,
  metricUnit,
  gpusInitial,
  maxRows,
  showTierDividers = true,
  header,
}: GpuMetricsTableProps): JSX.Element {
  const [gpus, setGpus] = useState<PricedGpu[]>(gpusInitial)

  useEffect(() => {
    const sorted = sortGpusByPercentile(gpusInitial)
    setGpus(sorted)
  }, [gpusInitial])

  // Calculate cost percentiles for the $ per Metric column
  const costPercentiles = useMemo(
    () => calculateCostPercentiles(gpusInitial, primaryMetric),
    [gpusInitial, primaryMetric],
  )

  // Track which tier dividers we've already rendered
  const renderedTiers = new Set<number>()

  // Apply maxRows limit if set
  const displayGpus = maxRows ? gpus.slice(0, maxRows) : gpus

  return (
    <div className="table-responsive-lg">
      {header && (
        <div className="my-container-card-header">
          <h4>
            <Link className="underline-on-hover text-accent" href={header.href}>
              {header.title} →
            </Link>
          </h4>
        </div>
      )}
      <table className="table table-hover">
        <thead>
          <tr>
            <th
              style={{ textAlign: "left", whiteSpace: "nowrap", width: "1%" }}
            >
              GPU
            </th>
            <th
              style={{ textAlign: "right", whiteSpace: "nowrap", width: "1%" }}
            >
              Lowest Average Price
            </th>
            <th
              style={{
                textAlign: "left",
                whiteSpace: "nowrap",
                minWidth: "200px",
              }}
            >
              Raw Performance Ranking (Percentile)
            </th>
            <th
              style={{ textAlign: "right", whiteSpace: "nowrap", width: "1%" }}
            >
              $ per {metricUnit}
            </th>
          </tr>
        </thead>
        <tbody>
          {displayGpus.map((pricedGpu) => {
            const metricValue = pricedGpu.gpu[primaryMetric]
            const hasListings = pricedGpu.price.activeListingCount > 0
            const hasMetricValue = !isNil(metricValue)
            const percentile = pricedGpu.percentile
            const dollarsPer = dollarsPerMetric(
              pricedGpu.gpu,
              pricedGpu.price.minPrice,
              primaryMetric,
            )

            // Check if we need to render a tier divider before this GPU
            const tierDividers: TierThreshold[] = []
            if (showTierDividers && percentile !== undefined) {
              for (const tier of TIER_THRESHOLDS) {
                if (
                  !renderedTiers.has(tier.percentile) &&
                  percentile < tier.percentile
                ) {
                  tierDividers.push(tier)
                  renderedTiers.add(tier.percentile)
                }
              }
            }

            return (
              <Fragment key={pricedGpu.gpu.name}>
                {/* Render tier dividers if needed */}
                {tierDividers.map((tier) => (
                  <tr key={`tier-${tier.percentile}`}>
                    <td
                      colSpan={4}
                      className="text-muted fst-italic text-center py-2"
                      style={{
                        borderTop: "2px dashed var(--bs-secondary)",
                        borderBottom: "2px dashed var(--bs-secondary)",
                      }}
                    >
                      ↑ {tier.label} ↑
                    </td>
                  </tr>
                ))}

                {/* GPU row */}
                <tr>
                  {/* GPU Name */}
                  <td className="text-start" style={{ whiteSpace: "nowrap" }}>
                    <Link href={`/gpu/learn/card/${pricedGpu.gpu.name}`}>
                      {pricedGpu.gpu.label}
                    </Link>
                  </td>

                  {/* Lowest Average Price */}
                  <td className="text-end">
                    {hasListings ? (
                      <Link href={`/gpu/shop/${pricedGpu.gpu.name}`}>
                        <FormatCurrency
                          currencyValue={pricedGpu.price.minPrice}
                          forceInteger
                        />
                      </Link>
                    ) : (
                      <span className="text-muted">no listings</span>
                    )}
                  </td>

                  {/* Raw Performance Ranking */}
                  <td>
                    {hasMetricValue && percentile !== undefined ? (
                      <div
                        className="progress"
                        role="progressbar"
                        aria-valuenow={Math.round(
                          percentile * PERCENT_MULTIPLIER,
                        )}
                        aria-valuemin={0}
                        aria-valuemax={PERCENT_MULTIPLIER}
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${percentile * PERCENT_MULTIPLIER}%`,
                          }}
                        >
                          {formatPercentileOrdinal(percentile)} @ {metricValue}{" "}
                          {metricUnit}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted">metric n/a</span>
                    )}
                  </td>

                  {/* $ per Performance */}
                  <td className="text-end">
                    {hasListings && hasMetricValue ? (
                      <span
                        className={(() => {
                          const costPercentile = costPercentiles.get(
                            pricedGpu.gpu.name,
                          )
                          if (costPercentile === undefined) return ""
                          if (costPercentile >= PERCENTILE_75)
                            return "text-success"
                          if (costPercentile >= PERCENTILE_50)
                            return "text-warning"
                          return "text-danger"
                        })()}
                      >
                        <FormatCurrency value={dollarsPer} />
                      </span>
                    ) : (
                      <span className="text-muted">
                        {hasListings ? "metric n/a" : "no listings"}
                      </span>
                    )}
                  </td>
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
