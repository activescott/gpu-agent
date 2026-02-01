/**
 * ScalperPremiumChart - Shows RTX 50 series premiums above MSRP.
 * Displays as a horizontal bar chart with danger colors for high premiums.
 */
import { prismaSingleton } from "@/pkgs/server/db/db"
import type { BarChartConfig } from "@/pkgs/isomorphic/model/news"
import { ChartJS, ChartContainer } from "@/pkgs/client/components/charts"
import {
  DateRange,
  ChartComponentProps,
  parseDateRange,
  formatGpuName,
  CHART_HASHTAGS,
} from "./types"

interface ScalperPremiumRow {
  name: string
  msrp: number
  avgPrice: number
  lowestAvgPrice: number
  premiumPct: number
}

const LIMIT_RESULTS = 6
const HIGH_PREMIUM_THRESHOLD = 75

/**
 * Fetches scalper premium data for RTX 50 series GPUs.
 * Uses "lowest average price" (avg of 3 lowest listings) for stable pricing.
 */
async function fetchScalperPremiumData(
  dateRange: DateRange,
): Promise<ScalperPremiumRow[]> {
  const { startDate, endDate } = parseDateRange(dateRange.to)

  const result = await prismaSingleton.$queryRaw<ScalperPremiumRow[]>`
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
      WHERE l."cachedAt" >= ${startDate}
        AND l."cachedAt" <= ${endDate}
        AND l."exclude" = false
        AND l."gpuName" LIKE 'nvidia-geforce-rtx-50%'
      GROUP BY l."gpuName"
    )
    SELECT
      la.name,
      g."msrpUSD"::float as msrp,
      AVG(l."priceValue"::float) as "avgPrice",
      la.lowest_avg_price as "lowestAvgPrice",
      ROUND(((la.lowest_avg_price / g."msrpUSD"::float - 1) * 100)::numeric, 0)::float as "premiumPct"
    FROM lowest_avg la
    JOIN gpu g ON g.name = la.name
    JOIN "Listing" l ON l."gpuName" = la.name
      AND l."cachedAt" >= ${startDate}
      AND l."cachedAt" <= ${endDate}
      AND l."exclude" = false
    WHERE g."msrpUSD" IS NOT NULL
      AND g."msrpUSD" > 0
    GROUP BY la.name, g."msrpUSD", la.lowest_avg_price
    ORDER BY "premiumPct" DESC
    LIMIT ${LIMIT_RESULTS}
  `

  return result
}

/**
 * Builds the chart configuration from the data.
 */
function buildChartConfig(data: ScalperPremiumRow[]): BarChartConfig {
  return {
    id: "scalper-premium",
    title: "RTX 50 Series Scalper Premiums",
    chartType: "bar",
    unit: "% above MSRP",
    data: data.map((row) => ({
      label: formatGpuName(row.name),
      value: row.premiumPct,
      sublabel: `$${Math.round(row.lowestAvgPrice)} avg`,
      color: row.premiumPct > HIGH_PREMIUM_THRESHOLD ? "danger" : "warning",
    })),
  }
}

/**
 * Returns the chart configuration for image generation.
 */
export async function getScalperPremiumConfig(
  dateRange: DateRange,
): Promise<BarChartConfig> {
  const data = await fetchScalperPremiumData(dateRange)
  return buildChartConfig(data)
}

/**
 * React Server Component for rendering the chart on a page.
 */
export async function ScalperPremiumChart({
  dateRange,
}: ChartComponentProps): Promise<JSX.Element> {
  const config = await getScalperPremiumConfig(dateRange)

  const shareImageUrl = `/api/images/chart/ScalperPremiumChart?from=${dateRange.from}&to=${dateRange.to}`

  return (
    <ChartContainer
      title={config.title}
      shareImageUrl={shareImageUrl}
      hashtags={CHART_HASHTAGS.ScalperPremiumChart}
    >
      <ChartJS config={config} />
    </ChartContainer>
  )
}
