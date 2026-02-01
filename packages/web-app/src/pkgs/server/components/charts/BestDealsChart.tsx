/**
 * BestDealsChart - Shows GPUs with biggest discounts below MSRP.
 * Displays as a diverging bar chart with success colors for good deals.
 */
import { prismaSingleton } from "@/pkgs/server/db/db"
import type { DivergingBarChartConfig } from "@/pkgs/isomorphic/model/news"
import { ChartJS, ChartContainer } from "@/pkgs/client/components/charts"
import {
  DateRange,
  ChartComponentProps,
  parseDateRange,
  formatGpuName,
  CHART_HASHTAGS,
} from "./types"

interface BestDealRow {
  name: string
  msrp: number
  lowestAvgPrice: number
  discountPct: number
}

const LIMIT_RESULTS = 5

/**
 * Fetches best deal data for gaming GPUs below MSRP.
 * Uses "lowest average price" (avg of 3 lowest listings) for stable pricing.
 * Filters by gpu.category = 'gaming' and excludes RTX 50 series (covered by scalper premium chart).
 */
async function fetchBestDealsData(
  dateRange: DateRange,
): Promise<BestDealRow[]> {
  const { startDate, endDate } = parseDateRange(dateRange.to)

  const result = await prismaSingleton.$queryRaw<BestDealRow[]>`
    WITH lowest_avg AS (
      SELECT
        l."gpuName" as name,
        (SELECT AVG(price) FROM (
          SELECT "priceValue"::float as price
          FROM "Listing" l2
          WHERE l2."gpuName" = l."gpuName"
            AND l2."cachedAt" >= ${startDate}
            AND l2."cachedAt" <= ${endDate}
            AND l2."exclude" = false
          ORDER BY "priceValue"::float ASC
          LIMIT 3
        ) lowest_three) as lowest_avg_price
      FROM "Listing" l
      JOIN gpu g ON g.name = l."gpuName"
      WHERE l."cachedAt" >= ${startDate}
        AND l."cachedAt" <= ${endDate}
        AND l."exclude" = false
        AND g.category = 'gaming'
        AND l."gpuName" NOT LIKE 'nvidia-geforce-rtx-50%'
      GROUP BY l."gpuName"
    )
    SELECT
      la.name,
      g."msrpUSD"::float as msrp,
      la.lowest_avg_price as "lowestAvgPrice",
      ROUND(((la.lowest_avg_price / g."msrpUSD"::float - 1) * 100)::numeric, 0)::float as "discountPct"
    FROM lowest_avg la
    JOIN gpu g ON g.name = la.name
    WHERE g."msrpUSD" IS NOT NULL
      AND g."msrpUSD" > 0
      AND la.lowest_avg_price < g."msrpUSD"::float
    ORDER BY "discountPct" ASC
    LIMIT ${LIMIT_RESULTS}
  `

  return result
}

/**
 * Builds the chart configuration from the data.
 */
function buildChartConfig(data: BestDealRow[]): DivergingBarChartConfig {
  return {
    id: "best-deals",
    title: "Best Used GPU Deals (vs MSRP)",
    chartType: "diverging",
    unit: "% below MSRP",
    data: data.map((row) => ({
      label: formatGpuName(row.name),
      value: row.discountPct, // Already negative from query
      sublabel: `$${Math.round(row.lowestAvgPrice)} avg`,
      color: "success",
    })),
  }
}

/**
 * Returns the chart configuration for image generation.
 */
export async function getBestDealsConfig(
  dateRange: DateRange,
): Promise<DivergingBarChartConfig> {
  const data = await fetchBestDealsData(dateRange)
  return buildChartConfig(data)
}

/**
 * React Server Component for rendering the chart on a page.
 */
export async function BestDealsChart({
  dateRange,
}: ChartComponentProps): Promise<JSX.Element> {
  const config = await getBestDealsConfig(dateRange)

  const shareImageUrl = `/api/images/chart/BestDealsChart?from=${dateRange.from}&to=${dateRange.to}`

  return (
    <ChartContainer
      title={config.title}
      shareImageUrl={shareImageUrl}
      hashtags={CHART_HASHTAGS.BestDealsChart}
    >
      <ChartJS config={config} />
    </ChartContainer>
  )
}
