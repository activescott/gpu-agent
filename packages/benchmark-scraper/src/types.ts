import { z } from "zod"

/**
 * Schema for a single benchmark result for a GPU
 */
export const BenchmarkResultSchema = z.object({
  gpuNameRaw: z.string(),
  gpuNameMapped: z.string().optional(),
  value: z.number(),
  stdDev: z.number().optional(),
})

export type BenchmarkResult = z.infer<typeof BenchmarkResultSchema>

/**
 * Schema for a benchmark configuration (e.g., a specific resolution for CS2)
 */
export const BenchmarkDataSchema = z.object({
  benchmarkId: z.string(),
  benchmarkName: z.string(),
  configuration: z.string(),
  configurationId: z.string(),
  metricName: z.string(),
  results: z.array(BenchmarkResultSchema),
  scrapedAt: z.string(),
})

export type BenchmarkData = z.infer<typeof BenchmarkDataSchema>

/**
 * Configuration for scraping a benchmark
 */
export interface BenchmarkScraperConfig {
  benchmarkId: string
  benchmarkName: string
  url: string
  configurations?: Array<{
    name: string
    id: string
  }>
}
