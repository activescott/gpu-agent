import { Gpu } from "@/pkgs/isomorphic/model"
import {
  GpuSpecKey,
  GpuSpecKeys,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import { PercentileProgressBar, NoDataBar } from "./PercentileProgressBar"

import type { JSX } from "react"

interface GpuSpecsTableProps {
  gpu: Gpu
  gpuSpecPercentages: Record<GpuSpecKey, number>
  title?: string
}

/**
 * Displays a table of GPU specifications with percentile progress bars.
 * Reusable in both individual GPU pages and comparison views.
 */
export function GpuSpecsTable({
  gpu,
  gpuSpecPercentages,
  title,
}: GpuSpecsTableProps): JSX.Element {
  const tableTitle = title ?? `Specifications for ${gpu.label}`

  return (
    <>
      <h2>{tableTitle}</h2>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>Specification</th>
              <th style={{ minWidth: "250px" }}>Performance Ranking</th>
            </tr>
          </thead>
          <tbody>
            {GpuSpecKeys.map((key) => {
              const specValue = gpu[key]
              const percentile = gpuSpecPercentages[key]
              const specDesc = GpuSpecsDescription[key]
              const hasData =
                specValue !== null &&
                specValue !== undefined &&
                percentile !== null &&
                percentile !== undefined

              return (
                <tr key={key}>
                  <td style={{ whiteSpace: "nowrap" }}>{specDesc.label}</td>
                  <td>
                    {hasData ? (
                      <PercentileProgressBar
                        percentile={percentile}
                        value={specValue}
                        unit={specDesc.unitShortest}
                      />
                    ) : (
                      <NoDataBar />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
