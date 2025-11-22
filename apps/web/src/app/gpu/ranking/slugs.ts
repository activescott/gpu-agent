import { GpuMetricKey, GpuMetricsDescription } from "@/pkgs/isomorphic/model"

/**
 * Maps URL slugs to metric keys for the ranking pages
 */
const AI_SLUG_MAP = {
  "fp32-flops": "fp32TFLOPS" as GpuMetricKey,
  "tensor-cores": "tensorCoreCount" as GpuMetricKey,
  "fp16-flops": "fp16TFLOPS" as GpuMetricKey,
  "int8-tops": "int8TOPS" as GpuMetricKey,
  "memory-gb": "memoryCapacityGB" as GpuMetricKey,
  "memory-bandwidth-gbs": "memoryBandwidthGBs" as GpuMetricKey,
}

const GAMING_SLUG_MAP = {
  "counter-strike-2-fps-3840x2160":
    "counterStrike2Fps3840x2160" as GpuMetricKey,
  "counter-strike-2-fps-2560x1440":
    "counterStrike2Fps2560x1440" as GpuMetricKey,
  "counter-strike-2-fps-1920x1080":
    "counterStrike2Fps1920x1080" as GpuMetricKey,
  "3dmark-wildlife-extreme-fps": "3dmarkWildLifeExtremeFps" as GpuMetricKey,
}

export type RankingSlug =
  | keyof typeof AI_SLUG_MAP
  | keyof typeof GAMING_SLUG_MAP

export function mapSlugToMetric(
  slug: RankingSlug,
  category: "ai" | "gaming",
): GpuMetricKey {
  const slugMap = category === "ai" ? AI_SLUG_MAP : GAMING_SLUG_MAP
  const key = slugMap[slug as keyof typeof slugMap]
  if (!key) throw new Error(`Unknown slug: ${slug} for category ${category}`)
  return key
}

export function listRankingSlugs(category: "ai" | "gaming"): RankingSlug[] {
  const slugMap = category === "ai" ? AI_SLUG_MAP : GAMING_SLUG_MAP
  return Object.keys(slugMap) as RankingSlug[]
}

export function rankingTitle(
  slug: RankingSlug,
  category: "ai" | "gaming",
): string {
  const metric = mapSlugToMetric(slug, category)
  const desc = GpuMetricsDescription[metric]
  return `GPUs Ranked by $ / ${desc.label}`
}

export function rankingDescription(
  slug: RankingSlug,
  category: "ai" | "gaming",
): string {
  const metric = mapSlugToMetric(slug, category)
  const desc = GpuMetricsDescription[metric]
  return `Best GPUs for the money with performance specifications ranked by the $ per ${desc.label} cost-performance ratio.`
}

export function rankingCanonicalPath(
  slug: RankingSlug,
  category: "ai" | "gaming",
): string {
  return `/gpu/ranking/${category}/${slug}`
}

/**
 * Converts a GpuMetricKey back to its URL slug
 */
export function metricToSlug(
  metricKey: GpuMetricKey,
  category: "ai" | "gaming",
): RankingSlug | undefined {
  const slugMap = category === "ai" ? AI_SLUG_MAP : GAMING_SLUG_MAP
  const entry = Object.entries(slugMap).find(
    ([_, value]) => value === metricKey,
  )
  return entry ? (entry[0] as RankingSlug) : undefined
}

/**
 * Lists all available benchmark slugs (gaming category only)
 */
export function listBenchmarkSlugs(): RankingSlug[] {
  return listRankingSlugs("gaming")
}
