/**
 * GpuPriceHistoryChart - Shows price history for a single GPU.
 * Displays median and lowest average prices over time as a line chart.
 */
import type { LineChartConfig } from "@/pkgs/isomorphic/model/news"
import { ChartJS, ChartContainer } from "@/pkgs/client/components/charts"
import {
  getHistoricalPriceData,
  PriceHistoryPoint,
} from "@/pkgs/server/db/ListingRepository"

const DEFAULT_MONTHS = 6
const MIN_DATA_POINTS = 2
const PERCENT_MULTIPLIER = 100
/** Minimum price difference to show average comparison */
const PRICE_DIFF_THRESHOLD = 10

interface PriceInsights {
  /** Percentage change in median price from start to end of period */
  medianPriceChange: number
  /** Current (latest) median price */
  currentMedianPrice: number
  /** Average median price over the period */
  averageMedianPrice: number
  /** Whether the trend is up, down, or stable */
  trend: "up" | "down" | "stable"
  /** Number of days of data */
  daysOfData: number
}

/**
 * Calculates price insights from historical data.
 */
function calculateInsights(data: PriceHistoryPoint[]): PriceInsights {
  const firstPoint = data[0]
  const lastPoint = data.at(-1)!

  const startMedian = firstPoint.medianPrice
  const endMedian = lastPoint.medianPrice

  const medianPriceChange =
    ((endMedian - startMedian) / startMedian) * PERCENT_MULTIPLIER

  const averageMedianPrice =
    data.reduce((sum, point) => sum + point.medianPrice, 0) / data.length

  // Consider stable if change is within ±3%
  const stableThreshold = 3
  let trend: "up" | "down" | "stable"
  if (medianPriceChange > stableThreshold) {
    trend = "up"
  } else if (medianPriceChange < -stableThreshold) {
    trend = "down"
  } else {
    trend = "stable"
  }

  return {
    medianPriceChange,
    currentMedianPrice: endMedian,
    averageMedianPrice,
    trend,
    daysOfData: data.length,
  }
}

interface GpuPriceHistoryChartProps {
  /** GPU name (slug) used for data fetching */
  gpuName: string
  /** GPU label for display in chart title */
  gpuLabel: string
  /** Number of months of history to show (default: 6) */
  months?: number
}

/**
 * Builds the chart configuration from historical price data.
 */
function buildChartConfig(
  data: Awaited<ReturnType<typeof getHistoricalPriceData>>,
  gpuLabel: string,
): LineChartConfig {
  const labels = data.map((point) =>
    new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  )

  return {
    id: "gpu-price-history",
    title: `${gpuLabel} Price History`,
    chartType: "line",
    unit: "$",
    xAxisLabel: "Date",
    yAxisLabel: "Price ($)",
    series: [
      {
        label: "Median Price",
        color: "success",
        data: data.map((point, index) => ({
          x: labels[index],
          y: Math.round(point.medianPrice),
        })),
      },
      {
        label: "Lowest Avg Price",
        color: "warning",
        data: data.map((point, index) => ({
          x: labels[index],
          y: Math.round(point.lowestAvgPrice),
        })),
      },
    ],
  }
}

/**
 * Returns the chart configuration for image generation.
 * Used by the image API route.
 */
export async function getGpuPriceHistoryConfig(
  gpuName: string,
  gpuLabel: string,
  months = DEFAULT_MONTHS,
): Promise<LineChartConfig> {
  const data = await getHistoricalPriceData(gpuName, months)
  return buildChartConfig(data, gpuLabel)
}

/**
 * React Server Component for rendering GPU price history chart.
 * Shows median and lowest average prices over time.
 */
export async function GpuPriceHistoryChart({
  gpuName,
  gpuLabel,
  months = DEFAULT_MONTHS,
}: GpuPriceHistoryChartProps): Promise<JSX.Element> {
  const data = await getHistoricalPriceData(gpuName, months)
  const config = buildChartConfig(data, gpuLabel)

  const shareImageUrl = `/api/images/chart/GpuPriceHistoryChart?gpu=${encodeURIComponent(gpuName)}&months=${months}`

  // Check if we have enough data points for a meaningful trend
  const hasEnoughData = data.length >= MIN_DATA_POINTS

  if (!hasEnoughData) {
    return (
      <ChartContainer
        title={config.title}
        shareImageUrl={shareImageUrl}
        hashtags={["GPU", "GPUPrices", gpuLabel.replaceAll(/\s+/g, "")]}
      >
        <div className="alert alert-secondary">
          Insufficient historical data for price trends. More data will be
          available as we continue tracking prices.
        </div>
      </ChartContainer>
    )
  }

  const insights = calculateInsights(data)
  const changePercent = Math.abs(insights.medianPriceChange).toFixed(1)
  let trendText: string
  if (insights.trend === "up") {
    trendText = `up ${changePercent}%`
  } else if (insights.trend === "down") {
    trendText = `down ${changePercent}%`
  } else {
    trendText = "relatively stable"
  }

  return (
    <ChartContainer
      title={config.title}
      shareImageUrl={shareImageUrl}
      hashtags={["GPU", "GPUPrices", gpuLabel.replaceAll(/\s+/g, "")]}
    >
      {/* Editorial description and insights */}
      <p className="text-muted small mb-3">
        This chart tracks {gpuLabel} prices over the past {months} months based
        on eBay listings. The{" "}
        <strong className="text-success">green line</strong> shows the median
        price across all listings each day, while the{" "}
        <strong className="text-warning">yellow line</strong> shows the average
        of the three lowest-priced listings—a useful indicator for finding
        deals.
      </p>
      <p className="text-muted small mb-3">
        <strong>Trend:</strong> Over this period, the median price has been{" "}
        {trendText}. The current median is{" "}
        <strong>
          ${Math.round(insights.currentMedianPrice).toLocaleString()}
        </strong>
        {Math.abs(insights.currentMedianPrice - insights.averageMedianPrice) >
          PRICE_DIFF_THRESHOLD && (
          <>
            , compared to a typical{" "}
            <strong>
              ${Math.round(insights.averageMedianPrice).toLocaleString()}
            </strong>{" "}
            over the period
          </>
        )}
        .
      </p>

      <ChartJS config={config} height={400} showWatermark />
    </ChartContainer>
  )
}
