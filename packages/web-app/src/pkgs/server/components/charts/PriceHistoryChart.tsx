/**
 * PriceHistoryChart - Shows 6-month price trends for popular GPUs.
 * Displays as a line chart with multiple series.
 */
import { prismaSingleton } from "@/pkgs/server/db/db"
import type {
  LineChartConfig,
  LineChartSeries,
} from "@/pkgs/isomorphic/model/news"
import { ChartJS, ChartContainer } from "@/pkgs/client/components/charts"
import {
  DateRange,
  ChartComponentProps,
  formatGpuName,
  CHART_HASHTAGS,
} from "./types"

interface MonthlyPriceRow {
  gpuName: string
  monthLabel: string
  avgPrice: number
  monthOrder: number
}

const MONTHS_TO_SHOW = 6

/**
 * GPUs to show in the price history chart.
 * Curated list of popular GPUs for market reports.
 */
const DEFAULT_GPUS = [
  "nvidia-geforce-rtx-4070-super",
  "nvidia-geforce-rtx-3080",
]

const COLOR_PALETTE: ("primary" | "success" | "warning" | "danger")[] = [
  "primary",
  "success",
  "warning",
  "danger",
]

/**
 * Fetches monthly price history for tracked GPUs.
 * Returns data for the 6 months ending at the specified date.
 */
async function fetchPriceHistoryData(
  dateRange: DateRange,
  gpus: string[] = DEFAULT_GPUS,
): Promise<MonthlyPriceRow[]> {
  const [year, month] = dateRange.to.split("-").map(Number)
  const endDate = new Date(year, month, 0) // Last day of target month
  const startDate = new Date(year, month - MONTHS_TO_SHOW, 1)

  const result = await prismaSingleton.$queryRaw<MonthlyPriceRow[]>`
    WITH monthly_data AS (
      SELECT
        "gpuName",
        DATE_TRUNC('month', "cachedAt") as month_date,
        "priceValue"::float as price
      FROM "Listing"
      WHERE "cachedAt" >= ${startDate}
        AND "cachedAt" <= ${endDate}
        AND "exclude" = false
        AND "gpuName" = ANY(${gpus})
    )
    SELECT
      "gpuName",
      TO_CHAR(month_date, 'Mon ''YY') as "monthLabel",
      AVG(price) as "avgPrice",
      EXTRACT(YEAR FROM month_date) * 12 + EXTRACT(MONTH FROM month_date) as "monthOrder"
    FROM monthly_data
    GROUP BY "gpuName", month_date
    ORDER BY "gpuName", "monthOrder"
  `

  return result
}

/**
 * Transforms raw data into chart series format.
 */
function buildSeries(
  data: MonthlyPriceRow[],
  gpus: string[],
): LineChartSeries[] {
  // Group by GPU
  const byGpu = new Map<string, MonthlyPriceRow[]>()
  for (const row of data) {
    const existing = byGpu.get(row.gpuName) || []
    existing.push(row)
    byGpu.set(row.gpuName, existing)
  }

  // Convert to series format, using GPU order for color assignment
  const series: LineChartSeries[] = []
  for (const [gpuName, rows] of byGpu) {
    const gpuIndex = gpus.indexOf(gpuName)
    const color =
      COLOR_PALETTE[gpuIndex >= 0 ? gpuIndex % COLOR_PALETTE.length : 0]
    series.push({
      label: formatGpuName(gpuName),
      color,
      data: rows.map((row) => ({
        x: row.monthLabel,
        y: Math.round(row.avgPrice),
      })),
    })
  }

  return series
}

/**
 * Builds the chart configuration from the data.
 */
function buildChartConfig(
  data: MonthlyPriceRow[],
  gpus: string[],
): LineChartConfig {
  return {
    id: "price-history",
    title: "GPU Price Trends (6 Month)",
    chartType: "line",
    unit: "$",
    xAxisLabel: "Month",
    yAxisLabel: "Avg Price ($)",
    series: buildSeries(data, gpus),
  }
}

/**
 * Returns the chart configuration for image generation.
 */
export async function getPriceHistoryConfig(
  dateRange: DateRange,
): Promise<LineChartConfig> {
  const data = await fetchPriceHistoryData(dateRange)
  return buildChartConfig(data, DEFAULT_GPUS)
}

// Minimum data points required for a meaningful trend
const MIN_DATA_POINTS = 2

interface PriceHistoryChartProps extends ChartComponentProps {
  /** Optional list of GPU slugs to track. Defaults to a curated list of popular GPUs. */
  gpus?: string[]
}

/**
 * React Server Component for rendering the chart on a page.
 */
export async function PriceHistoryChart({
  dateRange,
  gpus,
}: PriceHistoryChartProps): Promise<JSX.Element> {
  const trackedGpus = gpus ?? DEFAULT_GPUS
  const data = await fetchPriceHistoryData(dateRange, trackedGpus)
  const config = buildChartConfig(data, trackedGpus)

  const shareImageUrl = `/api/images/chart/PriceHistoryChart?from=${dateRange.from}&to=${dateRange.to}`

  // Check if we have enough data points for a meaningful trend
  const hasEnoughData = config.series.some(
    (series) => series.data.length >= MIN_DATA_POINTS,
  )

  if (!hasEnoughData) {
    return (
      <ChartContainer
        title={config.title}
        shareImageUrl={shareImageUrl}
        hashtags={CHART_HASHTAGS.PriceHistoryChart}
      >
        <div className="alert alert-secondary">
          Insufficient historical data for price trends. Multiple months of data
          are required.
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title={config.title}
      shareImageUrl={shareImageUrl}
      hashtags={CHART_HASHTAGS.PriceHistoryChart}
    >
      <ChartJS config={config} height={400} />
    </ChartContainer>
  )
}
