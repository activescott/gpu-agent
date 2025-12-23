import { PercentileProgressBar, NoDataBar } from "./PercentileProgressBar"

import type { JSX } from "react"

export interface BenchmarkPercentile {
  slug: string
  name: string
  unit: string
  value: number | undefined
  percentile: number | undefined
}

interface GpuBenchmarksTableProps {
  gpuLabel: string
  benchmarkPercentiles: BenchmarkPercentile[]
  title?: string
}

/**
 * Displays a table of gaming benchmarks with percentile progress bars.
 * Reusable in both individual GPU pages and comparison views.
 */
export function GpuBenchmarksTable({
  gpuLabel,
  benchmarkPercentiles,
  title,
}: GpuBenchmarksTableProps): JSX.Element | null {
  if (!benchmarkPercentiles || benchmarkPercentiles.length === 0) {
    return null
  }

  const tableTitle = title ?? `Gaming Benchmarks for ${gpuLabel}`

  return (
    <>
      <h2 className="mt-4">{tableTitle}</h2>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>Benchmark</th>
              <th style={{ minWidth: "250px" }}>Performance Ranking</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkPercentiles.map((benchmark) => (
              <tr key={benchmark.slug}>
                <td style={{ whiteSpace: "nowrap" }}>{benchmark.name}</td>
                <td>
                  {benchmark.value !== undefined &&
                  benchmark.percentile !== undefined ? (
                    <PercentileProgressBar
                      percentile={benchmark.percentile}
                      value={benchmark.value}
                      unit={benchmark.unit}
                    />
                  ) : (
                    <NoDataBar />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
