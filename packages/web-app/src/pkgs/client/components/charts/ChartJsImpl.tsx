"use client"

import { useMemo } from "react"
import type { ChartData, ChartOptions } from "chart.js"
import {
  Chart as ChartJSLib,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import type { ChartConfig } from "@/pkgs/isomorphic/model/news"
import { chartConfigToChartJS } from "@/pkgs/isomorphic/charts"

// Register Chart.js components
ChartJSLib.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

export interface ChartJSImplProps {
  /** The chart configuration to render */
  config: ChartConfig
  /** Chart height in pixels */
  height: number
}

/**
 * Chart.js implementation component.
 * Renders charts using react-chartjs-2 based on ChartConfig.
 */
export function ChartJSImpl({ config, height }: ChartJSImplProps): JSX.Element {
  // Convert our config to Chart.js config
  const chartConfig = useMemo(() => {
    return chartConfigToChartJS(config, { serverSide: false })
  }, [config])

  // Determine which chart component to use based on chart type
  switch (config.chartType) {
    case "bar":
    case "diverging": {
      return (
        <Bar
          data={chartConfig.data as ChartData<"bar">}
          options={chartConfig.options as ChartOptions<"bar">}
          height={height}
        />
      )
    }
    case "line": {
      return (
        <Line
          data={chartConfig.data as ChartData<"line">}
          options={chartConfig.options as ChartOptions<"line">}
          height={height}
        />
      )
    }
    default: {
      return <div>Unsupported chart type</div>
    }
  }
}

export default ChartJSImpl
