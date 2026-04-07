/**
 * DollarsPerInt8TopChart - Shows price-per-INT8-TOP rankings for AI inference.
 * Displays as a vertical bar chart sorted by best value (lowest $/TOP).
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

interface DollarsPerInt8TopRow {
  gpuName: string
  bestDeal: number
  int8Tops: number
  vramGb: number | null
  dollarsPerTop: number
}

const LIMIT_RESULTS = 15
const GOOD_VALUE_THRESHOLD = 1.2
const FAIR_VALUE_THRESHOLD = 1.8

async function fetchData(
  dateRange: DateRange,
): Promise<DollarsPerInt8TopRow[]> {
  const { startDate, endDate } = parseDateRange(dateRange.to)

  return prismaSingleton.$queryRaw<DollarsPerInt8TopRow[]>`
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
      gmv.value::float as "int8Tops",
      gmv2.value::float as "vramGb",
      ROUND((p."bestDeal" / NULLIF(gmv.value::float, 0))::numeric, 2)::float as "dollarsPerTop"
    FROM prices p
    JOIN "GpuMetricValue" gmv ON gmv."gpuName" = p."gpuName" AND gmv."metricSlug" = 'int8-tops'
    LEFT JOIN "GpuMetricValue" gmv2 ON gmv2."gpuName" = p."gpuName" AND gmv2."metricSlug" = 'memory-gb'
    WHERE p."bestDeal" > 50
      AND gmv.value::float > 0
    ORDER BY "dollarsPerTop" ASC
    LIMIT ${LIMIT_RESULTS}
  `
}

function valueColor(value: number): "success" | "warning" | "primary" {
  if (value <= GOOD_VALUE_THRESHOLD) return "success"
  if (value <= FAIR_VALUE_THRESHOLD) return "warning"
  return "primary"
}

function buildChartConfig(data: DollarsPerInt8TopRow[]): BarChartConfig {
  return {
    id: "dollars-per-int8-top",
    title: "Best Value GPUs: $/INT8 TOP (AI Inference)",
    chartType: "bar",
    unit: "$",
    orientation: "vertical",
    data: data.map((row) => ({
      label: formatGpuName(row.gpuName),
      value: row.dollarsPerTop,
      sublabel: `$${Math.round(row.bestDeal)}, ${row.int8Tops} TOPS${row.vramGb ? `, ${row.vramGb}GB` : ""}`,
      color: valueColor(row.dollarsPerTop),
    })),
  }
}

export async function getDollarsPerInt8TopConfig(
  dateRange: DateRange,
): Promise<BarChartConfig> {
  const data = await fetchData(dateRange)
  return buildChartConfig(data)
}

export async function DollarsPerInt8TopChart({
  dateRange,
}: ChartComponentProps): Promise<JSX.Element> {
  const config = await getDollarsPerInt8TopConfig(dateRange)
  const shareImageUrl = `/api/images/chart/DollarsPerInt8TopChart?from=${dateRange.from}&to=${dateRange.to}`

  return (
    <ChartContainer
      title={config.title}
      subtitle="Lower is better"
      shareImageUrl={shareImageUrl}
      hashtags={
        CHART_HASHTAGS.DollarsPerInt8TopChart ?? ["GPU", "AI", "Inference"]
      }
    >
      <ChartJS config={config} />
    </ChartContainer>
  )
}
