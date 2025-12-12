import { z } from "zod"

/**
 * Zod schema for GPU benchmark fields.
 * NOTE: Benchmark values are now stored in the GpuMetricValue table,
 * not directly on the gpu table. This schema is kept empty for backwards
 * compatibility with the Gpu type which extends it.
 */
const _GpuBenchmarksSchema = z.object({})

type GpuBenchmarks = z.infer<typeof _GpuBenchmarksSchema>

export type GpuBenchmarkKey = keyof GpuBenchmarks

export const GpuBenchmarkKeys: GpuBenchmarkKey[] = []

interface _GpuBenchmarkItem {
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
