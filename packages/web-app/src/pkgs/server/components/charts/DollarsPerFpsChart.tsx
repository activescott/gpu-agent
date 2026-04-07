/**
 * DollarsPerFpsChart - Shows price-per-FPS rankings using CS2 1440p benchmarks.
 * Displays as a vertical bar chart sorted by best value (lowest $/FPS).
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

interface DollarsPerFpsRow {
  gpuName: string
  bestDeal: number
  cs2Fps: number
  dollarsPerFps: number
}

const LIMIT_RESULTS = 15
const GOOD_VALUE_THRESHOLD = 1.2
const FAIR_VALUE_THRESHOLD = 1.8

async function fetchDollarsPerFpsData(
  dateRange: DateRange,
): Promise<DollarsPerFpsRow[]> {
  const { startDate, endDate } = parseDateRange(dateRange.to)

  const result = await prismaSingleton.$queryRaw<DollarsPerFpsRow[]>`
    WITH prices AS (
      SELECT
        l."gpuName",
        (SELECT AVG(price) FROM (
          SELECT "priceValue"::float as price
          FROM "Listing" l2
          WHERE l2."gpuName" = l."gpuName"
            AND l2."cachedAt" >= ${startDate}
            AND l2."cachedAt" <= ${endDate}
            AND l2."exclude" = false
          ORDER BY "priceValue"::float ASC
          LIMIT 3
        ) t) as "bestDeal"
      FROM "Listing" l
      WHERE l."cachedAt" >= ${startDate}
        AND l."cachedAt" <= ${endDate}
        AND l."exclude" = false
      GROUP BY l."gpuName"
    )
    SELECT
      p."gpuName",
      ROUND(p."bestDeal"::numeric)::float as "bestDeal",
      gmv.value::float as "cs2Fps",
      ROUND((p."bestDeal" / NULLIF(gmv.value::float, 0))::numeric, 2)::float as "dollarsPerFps"
    FROM prices p
    JOIN "GpuMetricValue" gmv ON gmv."gpuName" = p."gpuName"
    WHERE gmv."metricSlug" = 'counter-strike-2-fps-2560x1440'
      AND p."bestDeal" > 50
      AND gmv.value::float > 0
    ORDER BY "dollarsPerFps" ASC
    LIMIT ${LIMIT_RESULTS}
  `

  return result
}

function valueColor(value: number): "success" | "warning" | "primary" {
  if (value <= GOOD_VALUE_THRESHOLD) return "success"
  if (value <= FAIR_VALUE_THRESHOLD) return "warning"
  return "primary"
}

function buildChartConfig(data: DollarsPerFpsRow[]): BarChartConfig {
  return {
    id: "dollars-per-fps",
    title: "Best Value GPUs: $/FPS (CS2 1440p)",
    chartType: "bar",
    unit: "$",
    orientation: "vertical",
    data: data.map((row) => ({
      label: formatGpuName(row.gpuName),
      value: row.dollarsPerFps,
      sublabel: `$${Math.round(row.bestDeal)} best deal, ${Math.round(row.cs2Fps)} FPS`,
      color: valueColor(row.dollarsPerFps),
    })),
  }
}

export async function getDollarsPerFpsConfig(
  dateRange: DateRange,
): Promise<BarChartConfig> {
  const data = await fetchDollarsPerFpsData(dateRange)
  return buildChartConfig(data)
}

export async function DollarsPerFpsChart({
  dateRange,
}: ChartComponentProps): Promise<JSX.Element> {
  const config = await getDollarsPerFpsConfig(dateRange)
  const shareImageUrl = `/api/images/chart/DollarsPerFpsChart?from=${dateRange.from}&to=${dateRange.to}`

  return (
    <ChartContainer
      title={config.title}
      subtitle="Lower is better"
      shareImageUrl={shareImageUrl}
      hashtags={CHART_HASHTAGS.DollarsPerFpsChart ?? ["GPU", "CS2", "GPUValue"]}
    >
      <ChartJS config={config} />
    </ChartContainer>
  )
}
