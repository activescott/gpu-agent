"use client"

import { useEffect, useMemo, useState } from "react"
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
import annotationPlugin from "chartjs-plugin-annotation"
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
  annotationPlugin,
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
  // Detect dark mode via prefers-color-scheme (site uses $color-mode-type: media-query).
  // Re-render when the user's system theme changes.
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Convert our config to Chart.js config
  const chartConfig = useMemo(() => {
    return chartConfigToChartJS(config, { serverSide: false, darkMode })
  }, [config, darkMode])

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
