"use client"
import { GpuMetricKey, GpuMetricsDescription } from "@/pkgs/isomorphic/model"
import { FormatCurrency } from "@/pkgs/client/components/FormatCurrency"
import Link from "next/link"
import { useEffect, useState, type JSX } from "react"
import { BootstrapIcon } from "@/pkgs/client/components/BootstrapIcon"
import { composeComparers } from "@/pkgs/isomorphic/collection"
import { curry } from "lodash"
import { dollarsPerMetric } from "@/pkgs/isomorphic/gpuTools"
import { PricedGpu } from "@/pkgs/server/db/GpuRepository"
import classNames from "classnames"
import { isNil } from "lodash-es"

const lowestPriceGpuMetricComparer = (
  compareMetric: GpuMetricKey,
  ascending: boolean,
  a: PricedGpu,
  b: PricedGpu,
): number => {
  const result =
    dollarsPerMetric(a.gpu, a.price.minPrice, compareMetric) -
    dollarsPerMetric(b.gpu, b.price.minPrice, compareMetric)
  return ascending ? result : -1 * result
}

function sortGpus(
  gpus: PricedGpu[],
  primaryMetric: GpuMetricKey,
  ascending: boolean,
): PricedGpu[] {
  const listingCountNotZeroComparer = (a: PricedGpu, b: PricedGpu): number => {
    if (a.price.activeListingCount === 0) return 1
    return b.price.activeListingCount === 0 ? -1 : 0
  }

  const lowPriceComparer = curry(lowestPriceGpuMetricComparer)(
    primaryMetric,
    ascending,
  )

  return [...gpus].sort(
    composeComparers(listingCountNotZeroComparer, lowPriceComparer),
  )
}

interface GpuMetricsTableProps {
  primaryMetricInitial: GpuMetricKey
  gpusInitial: PricedGpu[]
  metricsToShow: GpuMetricKey[]
}

export function GpuMetricsTable({
  primaryMetricInitial,
  gpusInitial,
  metricsToShow,
}: GpuMetricsTableProps): JSX.Element {
  const [primaryMetric, setPrimaryMetric] =
    useState<GpuMetricKey>(primaryMetricInitial)
  const [ascending, setAscending] = useState<boolean>(true)
  const [gpus, setGpus] = useState<PricedGpu[]>(gpusInitial)

  const sortOrderIcon = ascending
    ? "arrow-up-circle-fill"
    : "arrow-down-circle-fill"
  const unsortedIcon = "arrow-down-up"

  useEffect(() => {
    const sorted = sortGpus(gpusInitial, primaryMetric, ascending)
    setGpus(sorted)
  }, [primaryMetric, ascending, gpusInitial])

  return (
    <div className="table-responsive-lg">
      <table className="table table-hover">
        <thead>
          <tr>
            <th style={{ textAlign: "left", minWidth: "250px" }}>GPU</th>

            {metricsToShow.map((metricKey) => (
              <th
                key={metricKey}
                style={{ textAlign: "right" }}
                className={metricKey === primaryMetric ? "table-active" : ""}
                onClick={() => {
                  if (metricKey === primaryMetric) {
                    setAscending(!ascending)
                  } else {
                    setPrimaryMetric(metricKey)
                    setAscending(true)
                  }
                }}
              >
                $ <span className="fw-light">/</span>{" "}
                {GpuMetricsDescription[metricKey].label}{" "}
                {metricKey === primaryMetric ? (
                  <BootstrapIcon icon={sortOrderIcon} size="xs" />
                ) : (
                  <BootstrapIcon icon={unsortedIcon} size="xs" />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gpus.map((pricedGpu) => (
            <tr key={pricedGpu.gpu.name}>
              <td className="text-start">
                <Link
                  href={`/gpu/shop/${pricedGpu.gpu.name}?sortBy=${primaryMetric}`}
                >
                  {pricedGpu.gpu.label}
                </Link>
              </td>

              {metricsToShow.map((metricKey) => {
                const metricValue = pricedGpu.gpu[metricKey]
                const dollarsPer = dollarsPerMetric(
                  pricedGpu.gpu,
                  pricedGpu.price.minPrice,
                  metricKey,
                )

                return (
                  <td
                    key={metricKey}
                    className={classNames([
                      "text-end",
                      {
                        "table-active": metricKey === primaryMetric,
                        "text-muted": isNil(metricValue),
                      },
                    ])}
                  >
                    {metricValue !== null && metricValue !== undefined ? (
                      <FormatCurrency value={dollarsPer} />
                    ) : (
                      "n/a"
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
