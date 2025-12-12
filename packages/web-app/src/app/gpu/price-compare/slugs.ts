import { GpuMetricKey } from "@/pkgs/isomorphic/model"
import { getAllMetricDefinitions } from "@/pkgs/server/db/GpuRepository"

/**
 * This module provides URL slug utilities for the price-compare pages.
 *
 * No hardcoded slug maps! Adding new benchmarks or specs only
 * requires updating the data files (YAML) and database - no code changes needed.
 */

// Cache the metric definitions to avoid repeated database queries
let cachedDefinitions: { slug: string; gpuField: string | null }[] | null = null

async function getDefinitions(): Promise<
  { slug: string; gpuField: string | null }[]
> {
  if (cachedDefinitions) {
    return cachedDefinitions
  }
  const defs = await getAllMetricDefinitions()
  cachedDefinitions = defs.map((d) => ({ slug: d.slug, gpuField: d.gpuField }))
  return cachedDefinitions
}

/**
 * Maps a GpuMetricKey (TypeScript field name) to a URL slug.
 * This is an async function since it queries the database.
 *
 * @param metric - The TypeScript field name (e.g., "fp32TFLOPS")
 * @returns The URL slug (e.g., "fp32-flops")
 */
export async function mapMetricToSlugAsync(
  metric: GpuMetricKey,
): Promise<string> {
  const definitions = await getDefinitions()
  const def = definitions.find((d) => d.gpuField === metric)
  if (!def) {
    throw new Error(
      `Unknown metric: ${metric} - no matching metric definition found in database`,
    )
  }
  return def.slug
}

/**
 * Synchronous version of mapMetricToSlug for use in non-async contexts.
 * Uses a simple conversion algorithm that matches the database slug format.
 *
 * This function converts TypeScript spec field names to URL slugs:
 * - fp32TFLOPS -> fp32-flops (note: TFLOPS becomes flops, not tflops)
 * - tensorCoreCount -> tensor-cores
 * - memoryCapacityGB -> memory-gb
 * - memoryBandwidthGBs -> memory-bandwidth-gbs
 *
 * Note: For guaranteed accuracy, prefer mapMetricToSlugAsync when possible.
 * Benchmark slugs are loaded from the database - use mapMetricToSlugAsync for benchmarks.
 *
 * @deprecated Find a way to get rid of this mapping here and special cases. Fine to use a http redirect to get routes to the right place.
 */
export function mapMetricToSlug(metric: GpuMetricKey): string {
  // Special cases for spec fields that don't follow a simple pattern
  const specialCases: Record<string, string> = {
    fp32TFLOPS: "fp32-flops",
    fp16TFLOPS: "fp16-flops",
    int8TOPS: "int8-tops",
    tensorCoreCount: "tensor-cores",
    memoryCapacityGB: "memory-gb",
    memoryBandwidthGBs: "memory-bandwidth-gbs",
  }

  const slug = specialCases[metric]
  if (slug) {
    return slug
  }

  // Fallback: convert camelCase to kebab-case
  // This shouldn't normally be reached for known metrics
  return metric.replaceAll(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

/**
 * Generates the canonical path for a metric slug in a category.
 *
 * @param slug - The URL slug (e.g., "fp32-flops")
 * @param category - The category ("ai" or "gaming")
 * @returns The canonical path (e.g., "/gpu/price-compare/ai/fp32-flops")
 */
export function canonicalPathForSlug(
  slug: string,
  category: "ai" | "gaming",
): string {
  return `/gpu/price-compare/${category}/${slug}`
}
