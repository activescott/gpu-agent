import {
  GpuMetricKey,
  GpuMetricsDescription,
  getMetricCategory,
} from "@/pkgs/isomorphic/model"

/**
 * Maps URL slugs to metric keys for the price-compare pages
 * Format: cost-per-{metric-name}
 */
const AI_SLUG_MAP = {
  "cost-per-fp32-flops": "fp32TFLOPS" as GpuMetricKey,
  "cost-per-tensor-core": "tensorCoreCount" as GpuMetricKey,
  "cost-per-fp16-flops": "fp16TFLOPS" as GpuMetricKey,
  "cost-per-int8-tops": "int8TOPS" as GpuMetricKey,
  "cost-per-memory-gb": "memoryCapacityGB" as GpuMetricKey,
  "cost-per-memory-bandwidth-gbs": "memoryBandwidthGBs" as GpuMetricKey,
}

const GAMING_SLUG_MAP = {
  "cost-per-counter-strike-2-fps-3840x2160":
    "counterStrike2Fps3840x2160" as GpuMetricKey,
  "cost-per-counter-strike-2-fps-2560x1440":
    "counterStrike2Fps2560x1440" as GpuMetricKey,
  "cost-per-counter-strike-2-fps-1920x1080":
    "counterStrike2Fps1920x1080" as GpuMetricKey,
  "cost-per-3dmark-wildlife-extreme-fps":
    "threemarkWildLifeExtremeFps" as GpuMetricKey,
}

export type BuySlug = keyof typeof AI_SLUG_MAP | keyof typeof GAMING_SLUG_MAP

export function mapSlugToMetric(
  slug: BuySlug,
  category: "ai" | "gaming",
): GpuMetricKey {
  const slugMap = category === "ai" ? AI_SLUG_MAP : GAMING_SLUG_MAP
  const key = slugMap[slug as keyof typeof slugMap]
  if (!key) throw new Error(`Unknown slug: ${slug} for category ${category}`)
  return key
}

export function mapMetricToSlug(metric: GpuMetricKey): BuySlug {
  const category = getMetricCategory(metric)
  const slugMap = category === "ai" ? AI_SLUG_MAP : GAMING_SLUG_MAP

  const slug = Object.entries(slugMap).find(([, v]) => v === metric)?.[0]
  if (!slug)
    throw new Error(`Unknown metric: ${metric} for category ${category}`)
  return slug as BuySlug
}

function mapSlugToMetricLabel(
  slug: BuySlug,
  category: "ai" | "gaming",
): string {
  const metric = mapSlugToMetric(slug, category)
  return GpuMetricsDescription[metric].label
}

export function mapSlugToPageTitle(
  slug: BuySlug,
  category: "ai" | "gaming",
): string {
  return `Compare GPU Prices by ${mapSlugToMetricLabel(slug, category)}`
}

export function mapSlugToPageDescription(
  slug: BuySlug,
  category: "ai" | "gaming",
): string {
  return `Compare GPU Prices by ${mapSlugToMetricLabel(slug, category)}`
}

export function listBuySlugs(category: "ai" | "gaming"): BuySlug[] {
  const slugMap = category === "ai" ? AI_SLUG_MAP : GAMING_SLUG_MAP
  return Object.keys(slugMap) as BuySlug[]
}

export function canonicalPathForSlug(
  slug: BuySlug,
  category: "ai" | "gaming",
): string {
  return `/gpu/price-compare/${category}/${slug}`
}
