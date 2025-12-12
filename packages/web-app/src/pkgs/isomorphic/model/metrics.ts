import { z } from "zod"
import { GpuSpecKey, GpuSpecKeys, GpuSpecsDescription } from "./specs"
import { GpuBenchmarkKey, GpuBenchmarkKeys } from "./benchmarks"

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
}

/**
 * Get the category for a metric
 */
export function getMetricCategory(metricKey: GpuMetricKey): "ai" | "gaming" {
  return GpuMetricsDescription[metricKey].category
}

/**
 * Combined schema for all GPU metrics (specs only).
 * NOTE: Benchmark values are now stored in the GpuMetricValue table,
 * not directly on the gpu table.
 */
export const GpuMetricsSchema = z.object({
  // Specs
  tensorCoreCount: z.number().optional().nullable(),
  fp32TFLOPS: z.number(),
  fp16TFLOPS: z.number(),
  int8TOPS: z.number().optional().nullable(),
  memoryCapacityGB: z.number(),
  memoryBandwidthGBs: z.number(),
})

export type GpuMetrics = z.infer<typeof GpuMetricsSchema>
