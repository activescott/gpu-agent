import { z } from "zod"

/**
 * Zod schema for GPU benchmark fields.
 * NOTE: Benchmark values are now stored in the GpuMetricValue table,
 * not directly on the gpu table. This schema is kept empty for backwards
 * compatibility with the Gpu type which extends it.
 */
export const GpuBenchmarksSchema = z.object({})

type GpuBenchmarks = z.infer<typeof GpuBenchmarksSchema>

export type GpuBenchmarkKey = keyof GpuBenchmarks

export const GpuBenchmarkKeys: GpuBenchmarkKey[] = []

export interface GpuBenchmarkItem {
  label: string
  unit: string
  unitShortest: string
  description: string
  descriptionDollarsPer: string
  category: "ai" | "gaming"
  benchmarkId: string
  benchmarkName: string
  slug: string
}
