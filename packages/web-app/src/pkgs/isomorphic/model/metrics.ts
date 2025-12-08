import { z } from "zod"
import { GpuSpecKey, GpuSpecKeys, GpuSpecsDescription } from "./specs"
import {
  GpuBenchmarkKey,
  GpuBenchmarkKeys,
  GpuBenchmarksDescription,
} from "./benchmarks"

/**
 * Unified type for all GPU metrics (specs + benchmarks)
 */
export type GpuMetricKey = GpuSpecKey | GpuBenchmarkKey

/**
 * All available metric keys
 */
export const GpuMetricKeys: GpuMetricKey[] = [
  ...GpuSpecKeys,
  ...GpuBenchmarkKeys,
]

/**
 * Metadata for a GPU metric (spec or benchmark)
 */
interface GpuMetricItem {
  label: string
  unit: string
  unitShortest: string
  description: string
  descriptionDollarsPer: string
  category: "ai" | "gaming"
}

/**
 * Combined descriptions for all metrics
 */
export const GpuMetricsDescription: Record<GpuMetricKey, GpuMetricItem> = {
  ...GpuSpecsDescription,
  ...GpuBenchmarksDescription,
}

/**
 * Type guard to check if a metric key is a spec
 */
export function isSpec(metricKey: GpuMetricKey): metricKey is GpuSpecKey {
  return GpuSpecKeys.includes(metricKey as GpuSpecKey)
}

/**
 * Type guard to check if a metric key is a benchmark
 */
export function isBenchmark(
  metricKey: GpuMetricKey,
): metricKey is GpuBenchmarkKey {
  return GpuBenchmarkKeys.includes(metricKey as GpuBenchmarkKey)
}

/**
 * Get the category for a metric
 */
export function getMetricCategory(metricKey: GpuMetricKey): "ai" | "gaming" {
  return GpuMetricsDescription[metricKey].category
}

/**
 * Combined schema for all GPU metrics
 */
export const GpuMetricsSchema = z.object({
  // Specs
  tensorCoreCount: z.number().optional().nullable(),
  fp32TFLOPS: z.number(),
  fp16TFLOPS: z.number(),
  int8TOPS: z.number().optional().nullable(),
  memoryCapacityGB: z.number(),
  memoryBandwidthGBs: z.number(),
  // Benchmarks
  counterStrike2Fps3840x2160: z.number().optional().nullable(),
  counterStrike2Fps2560x1440: z.number().optional().nullable(),
  counterStrike2Fps1920x1080: z.number().optional().nullable(),
  threemarkWildLifeExtremeFps: z.number().optional().nullable(),
})

export type GpuMetrics = z.infer<typeof GpuMetricsSchema>
