"use client"

import { useMemo, useRef } from "react"
import type { LineChartConfig } from "@/pkgs/isomorphic/model/news"
import { ChartJS, ChartContainer } from "@/pkgs/client/components/charts"
import { downloadChartWithBranding } from "@/pkgs/client/components/charts/downloadChartWithBranding"

interface PriceHistoryPoint {
  date: string
  lowestAvgPrice: number
  medianPrice: number
  listingCount: number
}

interface PriceChartProps {
  priceHistory: PriceHistoryPoint[]
  gpuName?: string
}

/**
 * Price history chart component with matching market report styling.
 * Shows median and lowest average (avg of 3 lowest) prices over time.
 */
export default function PriceChart({ priceHistory, gpuName }: PriceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const config: LineChartConfig = useMemo(() => {
    const labels = priceHistory.map((point) =>
      new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    )

    return {
      id: "price-history",
      title: "Price History",
      chartType: "line",
      xAxisLabel: "Date",
      yAxisLabel: "Price ($)",
      unit: "$",
      series: [
        {
          label: "Median Price",
          color: "success",
          data: priceHistory.map((point, index) => ({
            x: labels[index],
            y: Math.round(point.medianPrice),
          })),
        },
        {
          label: "Lowest Avg Price",
          color: "warning",
          data: priceHistory.map((point, index) => ({
            x: labels[index],
            y: Math.round(point.lowestAvgPrice),
          })),
        },
      ],
    }
  }, [priceHistory])

  const handleDownload = async () => {
    if (!chartRef.current) return

    // Find the canvas element
    const canvas = chartRef.current.querySelector("canvas")
    if (!canvas) return

    const title = gpuName ? `${gpuName} - Price History` : "GPU Price History"
    const filename = `price-history${gpuName ? `-${gpuName.replaceAll(/\s+/g, "-").toLowerCase()}` : ""}`

    await downloadChartWithBranding(canvas, {
      title,
      filename,
      date: new Date(),
    })
  }

  if (priceHistory.length === 0) {
    return (
      <ChartContainer title="Price History">
        <div className="alert alert-secondary">
          No price history data available.
        </div>
      </ChartContainer>
    )
  }

  return (
    <div ref={chartRef}>
      <ChartContainer
        title={config.title}
        shareTitle={`GPU Price History${gpuName ? ` - ${gpuName}` : ""}`}
      >
        <ChartJS config={config} height={400} showWatermark />
        <div className="mt-3 text-end">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDownload}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-download me-1"
              viewBox="0 0 16 16"
            >
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
            </svg>
            Download Chart
          </button>
        </div>
      </ChartContainer>
    </div>
  )
}
