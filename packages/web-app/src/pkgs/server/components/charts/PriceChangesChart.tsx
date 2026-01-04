/**
 * PriceChangesChart - Shows month-over-month price changes.
 * Displays as a diverging bar chart with colors based on direction.
 */
import { prismaSingleton } from "@/pkgs/server/db/db"
import type { DivergingBarChartConfig } from "@/pkgs/isomorphic/model/news"
import { ChartJS, ChartContainer } from "@/pkgs/client/components/charts"
import {
  DateRange,
  ChartComponentProps,
  parseDateRange,
  formatGpuName,
  getValueColor,
  CHART_HASHTAGS,
} from "./types"

interface PriceChangeRow {
  gpuName: string
  prevMonthAvg: number
  currMonthAvg: number
  pctChange: number
}

const LIMIT_RESULTS_DEFAULT = 5
const MONTH_PAD_LENGTH = 2
const MIN_PRICE_THRESHOLD = 100

/**
 * Fetches month-over-month price change data.
 * Compares the target month to the previous month.
 */
async function fetchPriceChangesData(
  dateRange: DateRange,
  resultCount: number = LIMIT_RESULTS_DEFAULT,
): Promise<PriceChangeRow[]> {
  const { startDate: currStart, endDate: currEnd } = parseDateRange(
    dateRange.to,
  )

  if (resultCount <= 0) {
    return []
  }

  // Calculate previous month
  const prevMonth = new Date(currStart)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  const prevYearMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(MONTH_PAD_LENGTH, "0")}`
  const { startDate: prevStart, endDate: prevEnd } =
    parseDateRange(prevYearMonth)

  const result = await prismaSingleton.$queryRaw<PriceChangeRow[]>`
    WITH curr_month AS (
      SELECT
        "gpuName",
        AVG("priceValue"::float) as avg_price
      FROM "Listing"
      WHERE "cachedAt" >= ${currStart}
        AND "cachedAt" <= ${currEnd}
        AND "archived" = false
      GROUP BY "gpuName"
      HAVING COUNT(*) >= 3
    ),
    prev_month AS (
      SELECT
        "gpuName",
        AVG("priceValue"::float) as avg_price
      FROM "Listing"
      WHERE "cachedAt" >= ${prevStart}
        AND "cachedAt" <= ${prevEnd}
      GROUP BY "gpuName"
      HAVING COUNT(*) >= 3
    )
    SELECT
      c."gpuName",
      p.avg_price as "prevMonthAvg",
      c.avg_price as "currMonthAvg",
      ROUND(((c.avg_price - p.avg_price) / p.avg_price * 100)::numeric, 0)::float as "pctChange"
    FROM curr_month c
    JOIN prev_month p ON c."gpuName" = p."gpuName"
    WHERE p.avg_price > ${MIN_PRICE_THRESHOLD}
    ORDER BY "pctChange" ASC
    LIMIT ${resultCount}
  `

  return result
}

/**
 * Formats price change for sublabel display.
 */
function formatPriceChange(prev: number, curr: number): string {
  return `$${Math.round(prev)} → $${Math.round(curr)}`
}

/**
 * Builds the chart configuration from the data.
 */
function buildChartConfig(data: PriceChangeRow[]): DivergingBarChartConfig {
  return {
    id: "price-changes",
    title: "Month-over-Month Price Changes",
    chartType: "diverging",
    unit: "%",
    data: data.map((row) => ({
      label: formatGpuName(row.gpuName),
      value: row.pctChange,
      sublabel: formatPriceChange(row.prevMonthAvg, row.currMonthAvg),
      color: getValueColor(row.pctChange),
    })),
  }
}

/**
 * Returns the chart configuration for image generation.
 */
export async function getPriceChangesConfig(
  dateRange: DateRange,
  resultCount: number = LIMIT_RESULTS_DEFAULT,
): Promise<DivergingBarChartConfig> {
  const data = await fetchPriceChangesData(dateRange, resultCount)
  return buildChartConfig(data)
}

/**
 * React Server Component for rendering the chart on a page.
 */
export async function PriceChangesChart({
  dateRange,
  resultCount,
}: ChartComponentProps): Promise<JSX.Element> {
  const config = await getPriceChangesConfig(dateRange, resultCount)

  const shareImageUrl = `/api/images/chart/PriceChangesChart?from=${dateRange.from}&to=${dateRange.to}`

  // Handle case where there's no data (e.g., no previous month data)
  if (config.data.length === 0) {
    return (
      <ChartContainer
        title={config.title}
        shareImageUrl={shareImageUrl}
        hashtags={CHART_HASHTAGS.PriceChangesChart}
      >
        <div className="alert alert-secondary">
          Insufficient data for month-over-month comparison. Historical data is
          required.
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title={config.title}
      shareImageUrl={shareImageUrl}
      hashtags={CHART_HASHTAGS.PriceChangesChart}
    >
      <ChartJS config={config} />
    </ChartContainer>
  )
}
