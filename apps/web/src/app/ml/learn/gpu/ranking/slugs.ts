import {
  GpuSpecKey,
  GpuSpecsDescription,
  // NOTE: this is not using the @/ import alias because gen-sitemap doesn't run in next's bundler and ts-node doesn't resolve it.
} from "../../../../../pkgs/isomorphic/model/specs"

const SlugMap = {
  "fp32-flops": "fp32TFLOPS",
  "tensor-cores": "tensorCoreCount",
  "fp16-flops": "fp16TFLOPS",
  "int8-tops": "int8TOPS",
  "memory-gb": "memoryCapacityGB",
  "memory-bandwidth-gbs": "memoryBandwidthGBs",
}

export type GpuSpecSlug = keyof typeof SlugMap

export function mapSlugToSpec(slug: GpuSpecSlug): GpuSpecKey {
  const key = SlugMap[slug] as GpuSpecKey
  if (!key) throw new Error(`Unknown slug: ${slug}`)
  return key
}

export function listGpuRankingSlugs(): GpuSpecSlug[] {
  return Object.keys(SlugMap) as GpuSpecSlug[]
}

export function gpuRankingTitle(slug: GpuSpecSlug): string {
  const desc = GpuSpecsDescription[mapSlugToSpec(slug)]
  return `GPUs Ranked by $ / ${desc.label}`
}

export function gpuRankingDescription(slug: GpuSpecSlug): string {
  const desc = GpuSpecsDescription[mapSlugToSpec(slug)]
  return `Best GPUs for the money with performance specifications ranked by the $ per ${desc.label} cost-performance ratio.`
}

export function gpuRankingCanonicalPath(slug: GpuSpecSlug): string {
  return `/ml/learn/gpu/ranking/${slug}`
}
