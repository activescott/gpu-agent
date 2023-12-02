import {
  GpuSpecKey,
  GpuSpecsDescription,
} from "../../../../../pkgs/isomorphic/model/specs"

const SlugMap = {
  "cost-per-fp32-flops": "fp32TFLOPS",
  "cost-per-tensor-core": "tensorCoreCount",
  "cost-per-fp16-flops": "fp16TFLOPS",
  "cost-per-memory-gb": "memoryCapacityGB",
  "cost-per-memory-bandwidth-gbs": "memoryBandwidthGBs",
}

export type PerformanceSlug = keyof typeof SlugMap

export function mapSlugToSpec(slug: PerformanceSlug): GpuSpecKey {
  const key = SlugMap[slug] as GpuSpecKey
  if (!key) throw new Error(`Unknown slug: ${slug}`)
  return key
}

function mapSlugToSpecLabel(slug: PerformanceSlug): string {
  const gpuSpec = mapSlugToSpec(slug)
  return GpuSpecsDescription[gpuSpec].label
}

export function mapSlugToPageTitle(slug: PerformanceSlug): string {
  return `Compare GPU Prices by ${mapSlugToSpecLabel(slug)}`
}

export function mapSlugToPageDescription(slug: PerformanceSlug): string {
  return `Compare GPU Prices by ${mapSlugToSpecLabel(slug)}`
}

export function listPerformanceSlugs(): PerformanceSlug[] {
  return Object.keys(SlugMap) as PerformanceSlug[]
}
