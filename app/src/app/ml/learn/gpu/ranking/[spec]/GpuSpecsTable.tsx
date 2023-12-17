"use client"
import {
  GpuSpecKey,
  GpuSpecKeys,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import { FormatCurrency } from "@/pkgs/client/components/FormatCurrency"
import Link from "next/link"
import { Gpu } from "@/pkgs/isomorphic/model"
import { useEffect, useState } from "react"
import { BootstrapIcon } from "@/pkgs/client/components/BootstrapIcon"
import { composeComparers } from "@/pkgs/isomorphic/collection"
import { divideSafe } from "@/pkgs/isomorphic/math"

export type PricedGpu = {
  gpu: Gpu
  price: { avgPrice: number; minPrice: number; activeListingCount: number }
}

const dollarsPerSpec = (gpu: Gpu, dollars: number, spec: GpuSpecKey): number =>
  divideSafe(dollars, gpu[spec])

function sortGpus(
  gpus: PricedGpu[],
  primarySpec: GpuSpecKey,
  ascending: boolean,
): PricedGpu[] {
  const lowestPriceComparer = (a: PricedGpu, b: PricedGpu): number => {
    const result =
      dollarsPerSpec(a.gpu, a.price.minPrice, primarySpec) -
      dollarsPerSpec(b.gpu, b.price.minPrice, primarySpec)
    return ascending ? result : -1 * result
  }

  const listingCountNotZeroComparer = (a: PricedGpu, b: PricedGpu): number => {
    if (a.price.activeListingCount === 0) return 1
    return b.price.activeListingCount === 0 ? -1 : 0
  }

  return [...gpus].sort(
    composeComparers(listingCountNotZeroComparer, lowestPriceComparer),
  )
}

interface GpuSpecsTableProps {
  primarySpecInitial: GpuSpecKey
  gpusInitial: PricedGpu[]
}
// TODO: break this out into a sortable table hook. It could return the sort icons for headers, sort callbacks, sorted row state
export function GpuSpecsTable({
  primarySpecInitial,
  gpusInitial,
}: GpuSpecsTableProps): JSX.Element {
  const [primarySpec, setPrimarySpec] = useState<GpuSpecKey>(primarySpecInitial)
  const [ascending, setAscending] = useState<boolean>(true)
  const [gpus, setGpus] = useState<PricedGpu[]>(gpusInitial)

  const sortOrderIcon = ascending
    ? "arrow-up-circle-fill"
    : "arrow-down-circle-fill"
  const unsortedIcon = "arrow-down-up"

  useEffect(() => {
    const sorted = sortGpus(gpusInitial, primarySpec, ascending)
    setGpus(sorted)
  }, [primarySpec, ascending, gpusInitial])

  return (
    <div className="table-responsive-lg">
      <table className="table table-hover">
        <thead>
          <tr>
            <th style={{ textAlign: "right" }}>GPU</th>

            {Object.values(GpuSpecKeys).map((specKey) => (
              <th
                key={specKey}
                style={{ textAlign: "right" }}
                className={specKey === primarySpec ? "table-active" : ""}
                onClick={() => {
                  if (specKey === primarySpec) {
                    setAscending(!ascending)
                  } else {
                    setPrimarySpec(specKey)
                    setAscending(true)
                  }
                }}
              >
                $ <span className="fw-light">/</span>{" "}
                {GpuSpecsDescription[specKey].label}{" "}
                {specKey === primarySpec ? (
                  <BootstrapIcon icon={sortOrderIcon} size="xs" />
                ) : (
                  <BootstrapIcon icon={unsortedIcon} size="xs" />
                )}
              </th>
            ))}
            <th style={{ textAlign: "right" }}>Minimum Price</th>
            <th style={{ textAlign: "right" }}>Available for Sale</th>
          </tr>
        </thead>
        <tbody>
          {gpus.map((gpu, index) => (
            <tr key={`${index}-${gpu.gpu.name}`}>
              <td style={{ textAlign: "right" }}>
                <Link href={`/ml/shop/gpu/${gpu.gpu.name}`}>
                  {gpu.gpu.label} {gpu.gpu.memoryCapacityGB}GB
                </Link>
              </td>
              {Object.values(GpuSpecKeys).map((specKey) => (
                <td
                  key={specKey}
                  style={{ textAlign: "right" }}
                  className={specKey === primarySpec ? "table-active" : ""}
                >
                  {gpu.price.activeListingCount > 0 ? (
                    <>
                      <FormatCurrency
                        currencyValue={dollarsPerSpec(
                          gpu.gpu,
                          gpu.price.minPrice,
                          specKey,
                        )}
                      />
                    </>
                  ) : (
                    "n/a"
                  )}
                  <div className="m-0 p-0 fs-6 fw-lighter text-muted">
                    <Link
                      href={`/ml/learn/gpu/${gpu.gpu.name}`}
                      className="link-opacity-25 link-opacity-100-hover link-secondary link-underline-opacity-0 link-underline-opacity-100-hover"
                    >
                      {gpu.gpu[specKey]
                        ? `${gpu.gpu[specKey]} ${GpuSpecsDescription[specKey].unitShortest}`
                        : "n/a"}
                    </Link>
                  </div>
                </td>
              ))}
              <td style={{ textAlign: "right" }}>
                {gpu.price.activeListingCount > 0 ? (
                  <Link href={`/ml/shop/gpu/${gpu.gpu.name}`}>
                    <FormatCurrency
                      forceInteger
                      currencyValue={gpu.price.minPrice}
                    />
                  </Link>
                ) : (
                  "n/a"
                )}
              </td>
              <td style={{ textAlign: "right" }}>
                <Link href={`/ml/shop/gpu/${gpu.gpu.name}`}>
                  {gpu.price.activeListingCount}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
