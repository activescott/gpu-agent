import { Gpu, parseGpu } from "@/pkgs/isomorphic/model"
import { isNil } from "lodash-es"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { GpuSpecKey } from "@/pkgs/isomorphic/model/specs"
import { Prisma } from "@prisma/client"
import { getPriceStats, GpuPriceStats } from "./ListingRepository"
import { omit } from "lodash"

/**
 * Cached metric definitions loaded from database
 */
let cachedMetricDefinitions: MetricDefinitionRecord[] | null = null

export interface MetricDefinitionRecord {
  slug: string
  name: string
  category: string
  metricType: string
  unit: string
  unitShortest: string
  description: string
  descriptionDollarsPer: string
  gpuField: string | null
}

/**
 * Loads all metric definitions from the database (cached)
 */
/**
 * Get priority for resolution sorting (4K first, then 1440p, then 1080p)
 */
function getResolutionPriority(name: string): number {
  if (name.includes("(4K)")) return 1
  if (name.includes("(1440p)")) return 2
  if (name.includes("(1080p)")) return 3
  return 4
}

/**
 * Helper to sort metric definitions consistently.
 * For gaming benchmarks, sorts by base name then by resolution (4K > 1440p > 1080p).
 * For other metrics, sorts alphabetically by name then slug.
 */
function sortMetricDefinitions(
  definitions: MetricDefinitionRecord[],
): MetricDefinitionRecord[] {
  return [...definitions].sort((a, b) => {
    // Extract base name without resolution suffix (e.g., "Counter-Strike 2" from "Counter-Strike 2 (4K)")
    const aBaseName = a.name.replace(/\s*\([^)]*\)\s*$/, "").trim()
    const bBaseName = b.name.replace(/\s*\([^)]*\)\s*$/, "").trim()

    // Sort by base name alphabetically
    const baseNameCompare = aBaseName.localeCompare(bBaseName)
    if (baseNameCompare !== 0) return baseNameCompare

    // Within same benchmark, sort by resolution (4K first)
    return getResolutionPriority(a.name) - getResolutionPriority(b.name)
  })
}

async function getMetricDefinitions(
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<MetricDefinitionRecord[]> {
  if (cachedMetricDefinitions) {
    // Always return sorted results, even if cache was populated before sorting was added
    return sortMetricDefinitions(cachedMetricDefinitions)
  }
  const results = await prisma.metricDefinition.findMany({
    select: {
      slug: true,
      name: true,
      category: true,
      metricType: true,
      unit: true,
      unitShortest: true,
      description: true,
      descriptionDollarsPer: true,
      gpuField: true,
    },
    // Sort by name to group related benchmarks together (e.g., Counter-Strike 2 configs grouped)
    // and by slug as secondary sort to order resolutions logically (1920x1080 < 2560x1440 < 3840x2160)
    orderBy: [{ name: "asc" }, { slug: "asc" }],
  })
  cachedMetricDefinitions = results
  return sortMetricDefinitions(cachedMetricDefinitions)
}

/**
 * Gets all metric slugs from database
 * @internal Reserved for future use
 */
async function _getAllMetricSlugs(
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<string[]> {
  const definitions = await getMetricDefinitions(prisma)
  return definitions.map((d) => d.slug)
}

/**
 * Gets the category for a metric slug from database
 * @internal Reserved for future use
 */
async function _getMetricCategoryFromDb(
  metricSlug: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<"ai" | "gaming"> {
  const definitions = await getMetricDefinitions(prisma)
  const def = definitions.find((d) => d.slug === metricSlug)
  if (!def) {
    throw new Error(`Unknown metric slug: ${metricSlug}`)
  }
  return def.category as "ai" | "gaming"
}

/**
 * Gets a metric definition by slug from database
 */
export async function getMetricDefinitionBySlug(
  metricSlug: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<MetricDefinitionRecord | null> {
  const definitions = await getMetricDefinitions(prisma)
  return definitions.find((d) => d.slug === metricSlug) || null
}

/**
 * Type alias for client consumption
 */
type MetricDefinition = MetricDefinitionRecord

/**
 * Gets all metric definitions from database.
 * Useful for MetricSelector component that needs the full list.
 */
export async function getAllMetricDefinitions(
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<MetricDefinition[]> {
  return getMetricDefinitions(prisma)
}

/**
 * Gets all metric values for a slug from GpuMetricValue table
 * @returns Map of GPU name to metric value
 */
export async function getMetricValuesBySlug(
  metricSlug: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Map<string, number>> {
  const results = await prisma.gpuMetricValue.findMany({
    where: { metricSlug },
    select: { gpuName: true, value: true },
  })

  const valueMap = new Map<string, number>()
  for (const row of results) {
    valueMap.set(row.gpuName, row.value)
  }
  return valueMap
}

/**
 * Gets all metric values for a category (e.g., "gaming" benchmarks)
 * @returns Map of GPU name to Map of metric slug to value
 */
export async function getAllMetricValuesForCategory(
  category: "gaming" | "ai",
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Map<string, Map<string, number>>> {
  // Get all metric definitions for this category
  const definitions = await getMetricDefinitions(prisma)
  const categorySlugs = definitions
    .filter((d) => d.category === category)
    .map((d) => d.slug)

  // Fetch all values for these metrics
  const results = await prisma.gpuMetricValue.findMany({
    where: { metricSlug: { in: categorySlugs } },
    select: { gpuName: true, metricSlug: true, value: true },
  })

  // Build nested map: GPU name -> metric slug -> value
  const gpuMetrics = new Map<string, Map<string, number>>()
  for (const row of results) {
    let gpuMap = gpuMetrics.get(row.gpuName)
    if (!gpuMap) {
      gpuMap = new Map()
      gpuMetrics.set(row.gpuName, gpuMap)
    }
    gpuMap.set(row.metricSlug, row.value)
  }
  return gpuMetrics
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
  /** The metric value for this GPU. Populated when needed for ranking. */
  metricValue?: number
}

export async function listGpus(includeTestGpus = false): Promise<Gpu[]> {
  const gpus = await prismaSingleton.gpu.findMany()
  return gpus
    .filter((gpu) => gpu.name !== "test-gpu" || includeTestGpus)
    .map((gpu) => parseGpu(gpu))
}

export async function getGpu(
  name: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Gpu> {
  const result = await prisma.gpu.findUnique({ where: { name } })
  if (!result) {
    throw new Error(`Gpu not found: ${name}`)
  }
  return parseGpu(result)
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

  const unsortedPricedGpus = await Promise.all(
    gpus.map(async (gpu) => {
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
 * Calculates percentile rankings for all GPUs based on a specific metric slug.
 * More efficient than calling gpuMetricAsPercent for each GPU individually.
 * @param metricSlug - The metric slug to calculate percentiles against
 * @returns Map of GPU name to percentile (0-1)
 */
export async function calculateAllGpuPercentilesForMetric(
  metricSlug: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Map<string, number>> {
  const sql = Prisma.sql`
    SELECT
      "gpuName" AS name,
      CUME_DIST() OVER (ORDER BY "value") AS pct
    FROM "GpuMetricValue"
    WHERE "metricSlug" = ${metricSlug}
      AND "value" IS NOT NULL
  ;`

  type RowShape = { name: string; pct: number }
  const results = await prisma.$queryRaw<RowShape[]>(sql)

  const percentileMap = new Map<string, number>()
  for (const row of results) {
    percentileMap.set(row.name, row.pct)
  }
  return percentileMap
}

type MetricRankingData = {
  metricSlug: string
  metricName: string
  metricUnit: string
  category: "ai" | "gaming"
  topGpus: PricedGpu[]
}

/**
 * Fetches all metric values for a given metric slug from GpuMetricValue table
 * @returns Map of GPU name to metric value
 */
async function getMetricValuesForMetricSlug(
  metricSlug: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Map<string, number>> {
  const results = await prisma.gpuMetricValue.findMany({
    where: { metricSlug },
    select: { gpuName: true, value: true },
  })

  const valueMap = new Map<string, number>()
  for (const row of results) {
    valueMap.set(row.gpuName, row.value)
  }
  return valueMap
}

/**
 * Fetches ranking data for all metrics and returns top N GPUs per metric.
 * Fully data-driven - loads metric definitions from database.
 */
const DEFAULT_TOP_N_RANKINGS = 3

export async function getAllMetricRankings(
  topN: number = DEFAULT_TOP_N_RANKINGS,
): Promise<MetricRankingData[]> {
  // Fetch base GPU price stats once
  const allPricedGpus = await calculateGpuPriceStats()

  // Get all metric definitions from database
  const metricDefinitions = await getMetricDefinitions()
  const metricSlugs = metricDefinitions.map((d) => d.slug)

  // Fetch percentiles and metric values for all metrics in parallel
  const metricDataPromises = metricSlugs.map(async (metricSlug) => {
    const [percentileMap, valueMap] = await Promise.all([
      calculateAllGpuPercentilesForMetric(metricSlug),
      getMetricValuesForMetricSlug(metricSlug),
    ])
    return { metricSlug, percentileMap, valueMap }
  })

  const metricDataResults = await Promise.all(metricDataPromises)

  // Build a lookup map for metric definitions
  const metricDefMap = new Map(metricDefinitions.map((d) => [d.slug, d]))

  // Build ranking data for each metric
  const rankings: MetricRankingData[] = metricDataResults.map(
    ({ metricSlug, percentileMap, valueMap }) => {
      // Merge percentiles and filter/sort for this metric
      const gpusWithPercentiles = allPricedGpus
        .map((gpu) => ({
          ...gpu,
          percentile: percentileMap.get(gpu.gpu.name),
          metricValue: valueMap.get(gpu.gpu.name),
        }))
        .filter((gpu) => {
          return (
            gpu.price.activeListingCount > 0 &&
            !isNil(gpu.metricValue) &&
            gpu.metricValue > 0
          )
        })

      // Sort by raw metric value (descending - highest performance first)
      gpusWithPercentiles.sort((a, b) => {
        const metricA = a.metricValue ?? 0
        const metricB = b.metricValue ?? 0
        return metricB - metricA
      })

      const metricDef = metricDefMap.get(metricSlug)
      if (!metricDef) {
        throw new Error(`Unknown metric slug: ${metricSlug}`)
      }

      return {
        metricSlug,
        metricName: metricDef.name,
        metricUnit: metricDef.unitShortest,
        category: metricDef.category as "ai" | "gaming",
        topGpus: gpusWithPercentiles.slice(0, topN),
      }
    },
  )

  return rankings
}
