import { Gpu, GpuMetricKeys, getMetricCategory } from "@/pkgs/isomorphic/model"
import { isNil } from "lodash-es"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { GpuSpecKey } from "@/pkgs/isomorphic/model/specs"
import { GpuMetricKey } from "@/pkgs/isomorphic/model/metrics"
import { Prisma } from "@prisma/client"
import { getPriceStats, GpuPriceStats } from "./ListingRepository"
import { omit } from "lodash"

/**
 * Maps Prisma TypeScript field names to actual database column names.
 * Some fields use @map in the schema (e.g., threemarkWildLifeExtremeFps -> 3dmarkWildLifeExtremeFps)
 */
function metricFieldToDbColumn(fieldName: GpuMetricKey): string {
  if (fieldName === "threemarkWildLifeExtremeFps") {
    return "3dmarkWildLifeExtremeFps"
  }
  return fieldName
}

type PricedGpuInfo = Omit<
  Gpu,
  "summary" | "references" | "supportedHardwareOperations" | "gpuArchitecture"
>

export type PricedGpu = {
  gpu: PricedGpuInfo
  price: GpuPriceStats
  /** Percentile ranking (0-1) for a specific metric. Populated when needed. */
  percentile?: number
}

export async function listGpus(includeTestGpus = false): Promise<Gpu[]> {
  const gpus = await prismaSingleton.gpu.findMany()
  return gpus.filter((gpu) => gpu.name !== "test-gpu" || includeTestGpus)
}

export async function getGpu(
  name: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Gpu> {
  const result = await prisma.gpu.findUnique({ where: { name } })
  if (!result) {
    throw new Error(`Gpu not found: ${name}`)
  }
  return result
}

export async function gpuSpecAsPercent(
  gpuName: string,
  spec: GpuSpecKey,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<number> {
  const sqlSpecName = Prisma.raw(`"${spec}"`)
  const sql = Prisma.sql`
  SELECT PCT FROM (
    SELECT
      name, 
      --PERCENT_RANK() OVER (ORDER BY ${sqlSpecName}) AS PCT
      CUME_DIST() OVER (ORDER BY ${sqlSpecName}) AS PCT
    FROM "gpu"
    WHERE ${sqlSpecName} IS NOT NULL
  ) AS RANKS
  WHERE "name" = ${gpuName}
  ;`

  type RowShape = { pct: number }
  const result = await prisma.$queryRaw<RowShape[]>(sql)
  if (result.length === 0) {
    return Number.NaN
  }
  const row = result[0]
  return row.pct
}

export async function calculateGpuPriceStats(): Promise<PricedGpu[]> {
  const gpus = await listGpus()

  const MIN_GPU_MEM_FOR_ML_GB = 10
  const unsortedPricedGpus = await Promise.all(
    gpus
      // Lets filter out the 8GB 580X and similarly low memory GPUs.
      .filter((gpu) => gpu.memoryCapacityGB >= MIN_GPU_MEM_FOR_ML_GB)
      .map(async (gpu) => {
        const stats = await getPriceStats(gpu.name)
        /*
        NOTE: React/Next.js server components dump all the props into the client-delivered JS making the page huge: https://github.com/vercel/next.js/discussions/42170
        Lighthouse complained about the JS size and this removed about ~16KB of JS from the page.
        */
        const gpuMinimal = omit(gpu, [
          "summary",
          "references",
          "supportedHardwareOperations",
          "gpuArchitecture",
        ])
        return {
          gpu: gpuMinimal,
          price: stats,
        } as PricedGpu
      }),
  )
  return unsortedPricedGpus
}

/**
 * Calculates the percentile ranking for a single GPU based on a specific metric.
 * Works with both specs and benchmarks.
 * @param gpuName - The GPU name to get percentile for
 * @param metric - The metric to calculate percentile against (spec or benchmark)
 * @returns Percentile as a decimal (0-1), or NaN if GPU not found or metric is null
 */
export async function gpuMetricAsPercent(
  gpuName: string,
  metric: GpuMetricKey,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<number> {
  const dbColumnName = metricFieldToDbColumn(metric)
  const sqlMetricName = Prisma.raw(`"${dbColumnName}"`)
  const sql = Prisma.sql`
  SELECT PCT FROM (
    SELECT
      name,
      CUME_DIST() OVER (ORDER BY ${sqlMetricName}) AS PCT
    FROM "gpu"
    WHERE ${sqlMetricName} IS NOT NULL
  ) AS RANKS
  WHERE "name" = ${gpuName}
  ;`

  type RowShape = { pct: number }
  const result = await prisma.$queryRaw<RowShape[]>(sql)
  if (result.length === 0) {
    return Number.NaN
  }
  const row = result[0]
  return row.pct
}

/**
 * Calculates percentile rankings for all GPUs based on a specific metric.
 * More efficient than calling gpuMetricAsPercent for each GPU individually.
 * @param metric - The metric to calculate percentiles against
 * @returns Map of GPU name to percentile (0-1)
 */
export async function calculateAllGpuPercentilesForMetric(
  metric: GpuMetricKey,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Map<string, number>> {
  const dbColumnName = metricFieldToDbColumn(metric)
  const sqlMetricName = Prisma.raw(`"${dbColumnName}"`)
  const sql = Prisma.sql`
    SELECT
      name,
      CUME_DIST() OVER (ORDER BY ${sqlMetricName}) AS pct
    FROM "gpu"
    WHERE ${sqlMetricName} IS NOT NULL
  ;`

  type RowShape = { name: string; pct: number }
  const results = await prisma.$queryRaw<RowShape[]>(sql)

  const percentileMap = new Map<string, number>()
  for (const row of results) {
    percentileMap.set(row.name, row.pct)
  }
  return percentileMap
}

export type MetricRankingData = {
  metric: GpuMetricKey
  category: "ai" | "gaming"
  topGpus: PricedGpu[]
}

/**
 * Fetches ranking data for all metrics and returns top N GPUs per metric.
 * Efficient - fetches base data once and calculates percentiles in parallel.
 */
export async function getAllMetricRankings(
  topN: number = 3,
): Promise<MetricRankingData[]> {
  // Fetch base GPU price stats once
  const allPricedGpus = await calculateGpuPriceStats()

  // Fetch percentiles for all metrics in parallel
  const percentilePromises = GpuMetricKeys.map(async (metric) => {
    const percentileMap = await calculateAllGpuPercentilesForMetric(metric)
    return { metric, percentileMap }
  })

  const percentileResults = await Promise.all(percentilePromises)

  // Build ranking data for each metric
  const rankings: MetricRankingData[] = percentileResults.map(
    ({ metric, percentileMap }) => {
      // Merge percentiles and filter/sort for this metric
      const gpusWithPercentiles = allPricedGpus
        .map((gpu) => ({
          ...gpu,
          percentile: percentileMap.get(gpu.gpu.name),
        }))
        .filter((gpu) => {
          const metricValue = gpu.gpu[metric]
          return (
            gpu.price.activeListingCount > 0 &&
            !isNil(metricValue) &&
            metricValue > 0
          )
        })

      // Sort by raw metric value (descending - highest performance first)
      gpusWithPercentiles.sort((a, b) => {
        const metricA = a.gpu[metric] ?? 0
        const metricB = b.gpu[metric] ?? 0
        return metricB - metricA
      })

      return {
        metric,
        category: getMetricCategory(metric),
        topGpus: gpusWithPercentiles.slice(0, topN),
      }
    },
  )

  return rankings
}
