/**
 * Converts ChartConfig types to Chart.js configuration objects.
 * This is isomorphic code that works in both browser (react-chartjs-2)
 * and server (chartjs-node-canvas) environments.
 */
import type { ChartConfiguration } from "chart.js"
import type {
  ChartConfig,
  BarChartConfig,
  DivergingBarChartConfig,
  LineChartConfig,
} from "../model/news"

/**
 * Color palette matching the site's Bootstrap-based theming.
 * Maps semantic color names to hex values.
 */
export const CHART_COLORS = {
  danger: "#ef4444", // Red - above MSRP, bad
  success: "#22c55e", // Green - below MSRP, good
  warning: "#f59e0b", // Orange - moderate
  primary: "#3b82f6", // Blue - default
} as const

/** Text and grid colors for chart elements */
const TEXT_COLOR = "#374151" // gray-700
const GRID_COLOR = "#e5e7eb" // gray-200
const BACKGROUND_COLOR = "#ffffff"

/** Default bar corner radius */
const BAR_BORDER_RADIUS = 4

/** Font and layout constants */
const BASE_FONT_SIZE = 12
const BASE_PADDING = 10
const PADDING_RIGHT_MULTIPLIER = 2
const ROUND_TO_NEAREST = 10

/** Line chart point styling */
const POINT_RADIUS = 4
const POINT_HOVER_RADIUS = 6
const LINE_BORDER_WIDTH = 2

/** Legend padding */
const LEGEND_PADDING = 20

type ChartColorKey = keyof typeof CHART_COLORS

/**
 * Options for chart rendering mode
 */
export interface ChartRenderOptions {
  /** If true, disables animations (for server-side rendering) */
  serverSide?: boolean
  /** Chart dimensions (required for server-side) */
  width?: number
  height?: number
  /** Scale factor for fonts (for high-DPI rendering). Default: 1 */
  scale?: number
}

/**
 * Converts a ChartConfig to a Chart.js ChartConfiguration.
 * Works for bar, diverging bar, and line charts.
 */
export function chartConfigToChartJS(
  config: ChartConfig,
  options: ChartRenderOptions = {},
): ChartConfiguration {
  switch (config.chartType) {
    case "bar": {
      return buildBarChartConfig(config, options)
    }
    case "diverging": {
      return buildDivergingChartConfig(config, options)
    }
    case "line": {
      return buildLineChartConfig(config, options)
    }
    default: {
      throw new Error(
        `Unknown chart type: ${(config as ChartConfig).chartType}`,
      )
    }
  }
}

/**
 * Builds Chart.js configuration for a horizontal bar chart.
 */
function buildBarChartConfig(
  config: BarChartConfig,
  options: ChartRenderOptions,
): ChartConfiguration<"bar"> {
  const labels = config.data.map((d) => d.label)
  const values = config.data.map((d) => d.value)
  const colors = config.data.map((d) => CHART_COLORS[d.color ?? "primary"])
  const scale = options.scale ?? 1
  const fontSize = BASE_FONT_SIZE * scale
  const padding = BASE_PADDING * scale

  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 0,
          borderRadius: BAR_BORDER_RADIUS * scale,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: "y", // Horizontal bar chart
      responsive: true,
      maintainAspectRatio: false,
      animation: options.serverSide ? false : undefined,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: !options.serverSide,
          callbacks: {
            label: (context) => {
              const value = context.parsed.x
              const unit = config.unit ?? ""
              const dataItem = config.data[context.dataIndex]
              const sublabel = dataItem?.sublabel
              return sublabel
                ? `${value}${unit} (${sublabel})`
                : `${value}${unit}`
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: GRID_COLOR,
          },
          ticks: {
            color: TEXT_COLOR,
            font: { size: fontSize },
            callback: (value) => `${value}${config.unit ?? ""}`,
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: TEXT_COLOR,
            font: { size: fontSize },
          },
        },
      },
      layout: {
        padding: {
          left: padding,
          right: padding * PADDING_RIGHT_MULTIPLIER,
          top: padding,
          bottom: padding,
        },
      },
    },
  }
}

/**
 * Builds Chart.js configuration for a diverging bar chart (positive/negative values).
 * Uses symmetric axis bounds centered at 0 for visual balance.
 */
function buildDivergingChartConfig(
  config: DivergingBarChartConfig,
  options: ChartRenderOptions,
): ChartConfiguration<"bar"> {
  const labels = config.data.map((d) => d.label)
  const values = config.data.map((d) => d.value)
  // Color based on positive/negative values
  const colors = config.data.map((d) => {
    if (d.color) return CHART_COLORS[d.color]
    return d.value >= 0 ? CHART_COLORS.danger : CHART_COLORS.success
  })

  const scale = options.scale ?? 1
  const fontSize = BASE_FONT_SIZE * scale
  const padding = BASE_PADDING * scale

  // Calculate symmetric axis bounds centered at 0
  // Find the maximum absolute value and round up to a nice number
  const maxAbsValue = Math.max(...values.map((v) => Math.abs(v)))
  const axisBound = Math.ceil(maxAbsValue / ROUND_TO_NEAREST) * ROUND_TO_NEAREST

  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 0,
          borderRadius: BAR_BORDER_RADIUS * scale,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: "y", // Horizontal bar chart
      responsive: true,
      maintainAspectRatio: false,
      animation: options.serverSide ? false : undefined,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: !options.serverSide,
          callbacks: {
            label: (context) => {
              const value = context.parsed.x ?? 0
              const unit = config.unit ?? ""
              const dataItem = config.data[context.dataIndex]
              const sublabel = dataItem?.sublabel
              const sign = value >= 0 ? "+" : ""
              return sublabel
                ? `${sign}${value}${unit} (${sublabel})`
                : `${sign}${value}${unit}`
            },
          },
        },
      },
      scales: {
        x: {
          min: -axisBound,
          max: axisBound,
          grid: {
            color: GRID_COLOR,
          },
          ticks: {
            color: TEXT_COLOR,
            font: { size: fontSize },
            callback: (value) => {
              const numValue = Number(value)
              const sign = numValue > 0 ? "+" : ""
              return `${sign}${numValue}${config.unit ?? ""}`
            },
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: TEXT_COLOR,
            font: { size: fontSize },
          },
        },
      },
      layout: {
        padding: {
          left: padding,
          right: padding * PADDING_RIGHT_MULTIPLIER,
          top: padding,
          bottom: padding,
        },
      },
    },
  }
}

/**
 * Builds Chart.js configuration for a line chart.
 */
function buildLineChartConfig(
  config: LineChartConfig,
  options: ChartRenderOptions,
): ChartConfiguration<"line"> {
  const scale = options.scale ?? 1
  const fontSize = BASE_FONT_SIZE * scale
  const padding = BASE_PADDING * scale

  // Extract x-axis labels from first series
  const labels = config.series[0]?.data.map((p) => p.x) ?? []

  const datasets = config.series.map((series) => ({
    label: series.label,
    data: series.data.map((p) => p.y),
    borderColor: CHART_COLORS[series.color ?? "primary"],
    backgroundColor: CHART_COLORS[series.color ?? "primary"],
    tension: 0.3, // Smooth curves
    pointRadius: POINT_RADIUS * scale,
    pointHoverRadius: POINT_HOVER_RADIUS * scale,
    borderWidth: LINE_BORDER_WIDTH * scale,
    fill: false,
  }))

  return {
    type: "line",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: options.serverSide ? false : undefined,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: TEXT_COLOR,
            usePointStyle: true,
            padding: LEGEND_PADDING * scale,
            font: { size: fontSize },
          },
        },
        tooltip: {
          enabled: !options.serverSide,
          mode: "index",
          intersect: false,
          callbacks: {
            label: (context) => {
              const unit = config.unit ?? ""
              return `${context.dataset.label}: ${unit}${context.parsed.y}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false, // No grid lines for cleaner look
          },
          ticks: {
            color: TEXT_COLOR,
            font: { size: fontSize },
          },
          title: config.xAxisLabel
            ? {
                display: true,
                text: config.xAxisLabel,
                color: TEXT_COLOR,
                font: { size: fontSize },
              }
            : undefined,
        },
        y: {
          grid: {
            display: false, // No grid lines for cleaner look
          },
          ticks: {
            color: TEXT_COLOR,
            font: { size: fontSize },
            callback: (value) => `${config.unit ?? ""}${value}`,
          },
          title: config.yAxisLabel
            ? {
                display: true,
                text: config.yAxisLabel,
                color: TEXT_COLOR,
                font: { size: fontSize },
              }
            : undefined,
        },
      },
      layout: {
        padding: {
          left: padding,
          right: padding * PADDING_RIGHT_MULTIPLIER,
          top: padding,
          bottom: padding,
        },
      },
    },
  }
}

/**
 * Get a color value from the palette
 */
export function getChartColor(color: ChartColorKey | undefined): string {
  return CHART_COLORS[color ?? "primary"]
}

/**
 * Background color for chart canvas
 */
export { BACKGROUND_COLOR }
