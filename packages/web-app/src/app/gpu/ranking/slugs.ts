import {
  GpuMetricKey,
  GpuSpecsDescription,
  GpuSpecKey,
} from "@/pkgs/isomorphic/model"

/**
 * Maps URL slugs to metric keys for AI specs (hardcoded).
 * Gaming slugs are now loaded from the database.
 *
 * @deprecated Us redirects if needed or use database-driven slug resolution
 */
const AI_SLUG_MAP = {
  "fp32-flops": "fp32TFLOPS" as GpuMetricKey,
  "tensor-cores": "tensorCoreCount" as GpuMetricKey,
  "fp16-flops": "fp16TFLOPS" as GpuMetricKey,
  "int8-tops": "int8TOPS" as GpuMetricKey,
  "memory-gb": "memoryCapacityGB" as GpuMetricKey,
  "memory-bandwidth-gbs": "memoryBandwidthGBs" as GpuMetricKey,
}

/**
 * Gaming slug map is now empty - gaming slugs are loaded from the database.
 * @deprecated Us redirects if needed or use database-driven slug resolution
 */
const _GAMING_SLUG_MAP: Record<string, GpuMetricKey> = {}

export type RankingSlug =
  | keyof typeof AI_SLUG_MAP
  | keyof typeof _GAMING_SLUG_MAP
  | string // Allow any string for database-loaded slugs

export function mapSlugToMetric(
  slug: RankingSlug,
  category: "ai" | "gaming",
): GpuMetricKey {
  if (category === "ai") {
    const key = AI_SLUG_MAP[slug as keyof typeof AI_SLUG_MAP]
    if (!key) throw new Error(`Unknown slug: ${slug} for category ${category}`)
    return key
  }
  // For gaming category, this function is deprecated
  // Use the database-driven approach instead
  throw new Error(
    `Unknown slug: ${slug} for category ${category}. Gaming slugs should use database-driven resolution.`,
  )
}

export function listRankingSlugs(category: "ai" | "gaming"): RankingSlug[] {
  if (category === "ai") {
    return Object.keys(AI_SLUG_MAP) as RankingSlug[]
  }
  // For gaming category, return empty - use database-driven approach
  return []
}

export function rankingTitle(
  slug: RankingSlug,
  category: "ai" | "gaming",
): string {
  if (category === "ai") {
    const metric = mapSlugToMetric(slug, category) as GpuSpecKey
    const desc = GpuSpecsDescription[metric]
    return `GPUs Ranked by $ / ${desc.label}`
  }
  // For gaming, use database-driven metadata
  return `GPUs Ranked by $ / Performance`
}

export function rankingDescription(
  slug: RankingSlug,
  category: "ai" | "gaming",
): string {
  if (category === "ai") {
    const metric = mapSlugToMetric(slug, category) as GpuSpecKey
    const desc = GpuSpecsDescription[metric]
    return `Best GPUs for the money with performance specifications ranked by the $ per ${desc.label} cost-performance ratio.`
  }
  // For gaming, use database-driven metadata
  return `Best GPUs for the money with performance specifications ranked by cost-performance ratio.`
}

export function rankingCanonicalPath(
  slug: RankingSlug,
  category: "ai" | "gaming",
): string {
  return `/gpu/ranking/${category}/${slug}`
}

/**
 * Converts a GpuMetricKey back to its URL slug (AI specs only)
 * @deprecated For gaming metrics, use database-driven slug resolution
 */
export function metricToSlug(
  metricKey: GpuMetricKey,
  category: "ai" | "gaming",
): RankingSlug | undefined {
  if (category === "ai") {
    const entry = Object.entries(AI_SLUG_MAP).find(
      ([, value]) => value === metricKey,
    )
    return entry ? (entry[0] as RankingSlug) : undefined
  }
  // For gaming, use database-driven approach
  return undefined
}

/**
 * Lists all available benchmark slugs (gaming category only)
 * @deprecated Use database-driven approach instead
 */
export function listBenchmarkSlugs(): RankingSlug[] {
  return listRankingSlugs("gaming")
}
