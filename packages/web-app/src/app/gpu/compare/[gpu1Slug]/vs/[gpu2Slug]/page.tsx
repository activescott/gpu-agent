import { GpuSpecKey, GpuSpecKeys } from "@/pkgs/isomorphic/model/specs"
import { Gpu } from "@/pkgs/isomorphic/model"
import {
  getGpu,
  gpuSpecAsPercent,
  getAllMetricDefinitions,
  calculateAllGpuPercentilesForMetric,
  getMetricValuesBySlug,
  listGpus,
} from "@/pkgs/server/db/GpuRepository"
import { getPriceStats } from "@/pkgs/server/db/ListingRepository"
import { notFound, redirect } from "next/navigation"
import { BenchmarkPercentile } from "@/pkgs/client/components/GpuBenchmarksTable"
import { GpuComparisonView } from "@/pkgs/client/components/GpuComparisonView"

// Revalidate every hour
export const revalidate = 3600

// Force dynamic rendering for database access
export const dynamic = "force-dynamic"

type CompareParams = {
  params: Promise<{ gpu1Slug: string; gpu2Slug: string }>
}

/**
 * Normalizes comparison URL to prevent duplicate content.
 * Always puts GPUs in alphabetical order.
 */
function normalizeComparisonUrl(
  gpu1Slug: string,
  gpu2Slug: string,
): { normalized: boolean; url: string } {
  const [first, second] = [gpu1Slug, gpu2Slug].sort()
  const normalized = first !== gpu1Slug
  return {
    normalized,
    url: `/gpu/compare/${first}/vs/${second}`,
  }
}

/**
 * Extracts the brand name from the GPU label
 */
function extractBrandName(label: string): string {
  const brand = label.split(" ")[0]
  if (brand.toUpperCase() === "AMD") return "AMD"
  if (brand.toUpperCase() === "NVIDIA") return "NVIDIA"
  if (brand.toUpperCase() === "INTEL") return "Intel"
  return brand
}

/**
 * Builds JSON-LD structured data for the comparison page.
 */
function buildStructuredData(gpu1: Gpu, gpu2: Gpu): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${gpu1.label} vs ${gpu2.label} - GPU Comparison`,
    description: `Compare ${gpu1.label} and ${gpu2.label} specifications, benchmarks, and prices.`,
    mainEntity: [
      {
        "@type": "Product",
        name: `${gpu1.label} ${gpu1.memoryCapacityGB}GB`,
        description: gpu1.summary,
        brand: {
          "@type": "Brand",
          name: extractBrandName(gpu1.label),
        },
        category: "Graphics Card",
      },
      {
        "@type": "Product",
        name: `${gpu2.label} ${gpu2.memoryCapacityGB}GB`,
        description: gpu2.summary,
        brand: {
          "@type": "Brand",
          name: extractBrandName(gpu2.label),
        },
        category: "Graphics Card",
      },
    ],
  }
}

export async function generateMetadata(props: CompareParams) {
  const params = await props.params
  const { gpu1Slug, gpu2Slug } = params

  // Check for canonical URL normalization
  const { normalized, url } = normalizeComparisonUrl(gpu1Slug, gpu2Slug)

  try {
    const [gpu1, gpu2] = await Promise.all([getGpu(gpu1Slug), getGpu(gpu2Slug)])

    return {
      title: `${gpu1.label} vs ${gpu2.label} - GPU Comparison | GPU Poet`,
      description: `Compare ${gpu1.label} and ${gpu2.label} specs, gaming benchmarks, and prices. Find out which GPU is better for gaming and AI/ML workloads.`,
      alternates: {
        canonical: `https://gpupoet.com${normalized ? url : `/gpu/compare/${gpu1Slug}/vs/${gpu2Slug}`}`,
      },
    }
  } catch {
    return {
      title: "GPU Comparison | GPU Poet",
      description: "Compare two GPUs side-by-side.",
    }
  }
}

async function fetchGpuData(gpuSlug: string) {
  const gpu = await getGpu(gpuSlug)

  // Fetch spec percentiles
  const specPercentileEntries = await Promise.all(
    GpuSpecKeys.map(async (key) => {
      const percentile = await gpuSpecAsPercent(gpu.name, key)
      return [key, percentile] as [GpuSpecKey, number]
    }),
  )
  const gpuSpecPercentages = Object.fromEntries(
    specPercentileEntries,
  ) as Record<GpuSpecKey, number>

  // Fetch price stats
  const priceStats = await getPriceStats(gpu.name)

  return { gpu, gpuSpecPercentages, priceStats }
}

async function fetchBenchmarkData(gpu1Name: string, gpu2Name: string) {
  const allMetrics = await getAllMetricDefinitions()
  const gamingMetrics = allMetrics.filter((m) => m.category === "gaming")

  const benchmarkData = await Promise.all(
    gamingMetrics.map(async (metric) => {
      const [percentileMap, valueMap] = await Promise.all([
        calculateAllGpuPercentilesForMetric(metric.slug),
        getMetricValuesBySlug(metric.slug),
      ])
      return {
        slug: metric.slug,
        name: metric.name,
        unit: metric.unitShortest,
        gpu1Value: valueMap.get(gpu1Name),
        gpu1Percentile: percentileMap.get(gpu1Name),
        gpu2Value: valueMap.get(gpu2Name),
        gpu2Percentile: percentileMap.get(gpu2Name),
      }
    }),
  )

  // Build benchmark arrays for each GPU
  const gpu1Benchmarks: BenchmarkPercentile[] = benchmarkData
    .filter((b) => b.gpu1Value !== undefined && b.gpu1Percentile !== undefined)
    .map((b) => ({
      slug: b.slug,
      name: b.name,
      unit: b.unit,
      value: b.gpu1Value,
      percentile: b.gpu1Percentile,
    }))

  const gpu2Benchmarks: BenchmarkPercentile[] = benchmarkData
    .filter((b) => b.gpu2Value !== undefined && b.gpu2Percentile !== undefined)
    .map((b) => ({
      slug: b.slug,
      name: b.name,
      unit: b.unit,
      value: b.gpu2Value,
      percentile: b.gpu2Percentile,
    }))

  return { gpu1Benchmarks, gpu2Benchmarks, benchmarkData }
}

export default async function ComparePage(props: CompareParams) {
  const params = await props.params
  const { gpu1Slug, gpu2Slug } = params

  // Redirect to canonical URL if not in alphabetical order
  const { normalized, url } = normalizeComparisonUrl(gpu1Slug, gpu2Slug)
  if (normalized) {
    redirect(url)
  }

  // Prevent comparing GPU to itself
  if (gpu1Slug === gpu2Slug) {
    redirect(`/gpu/learn/card/${gpu1Slug}`)
  }

  // Fetch GPU data in parallel
  let gpu1Data, gpu2Data
  try {
    ;[gpu1Data, gpu2Data] = await Promise.all([
      fetchGpuData(gpu1Slug),
      fetchGpuData(gpu2Slug),
    ])
  } catch {
    notFound()
  }

  const { gpu1Benchmarks, gpu2Benchmarks, benchmarkData } =
    await fetchBenchmarkData(gpu1Data.gpu.name, gpu2Data.gpu.name)

  // Fetch all GPU options for selectors
  const allGpus = await listGpus()
  const gpuOptions = allGpus.map((g) => ({ name: g.name, label: g.label }))

  const structuredData = buildStructuredData(gpu1Data.gpu, gpu2Data.gpu)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GpuComparisonView
        gpu1={gpu1Data.gpu}
        gpu2={gpu2Data.gpu}
        gpu1SpecPercentages={gpu1Data.gpuSpecPercentages}
        gpu2SpecPercentages={gpu2Data.gpuSpecPercentages}
        gpu1Benchmarks={gpu1Benchmarks}
        gpu2Benchmarks={gpu2Benchmarks}
        benchmarkData={benchmarkData}
        gpu1PriceStats={gpu1Data.priceStats}
        gpu2PriceStats={gpu2Data.priceStats}
        gpuOptions={gpuOptions}
      />
    </>
  )
}
