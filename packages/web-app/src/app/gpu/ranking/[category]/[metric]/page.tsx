import Link from "next/link"
import { Suspense } from "react"
import {
  calculateGpuPriceStats,
  calculateAllGpuPercentilesForMetric,
  getMetricDefinitionBySlug,
  getMetricValuesBySlug,
  getAllMetricDefinitions,
  getAllMetricValuesForCategory,
  MetricDefinitionRecord,
} from "@/pkgs/server/db/GpuRepository"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { RankingPageWithFilters } from "./RankingPageWithFilters"
import { MetricSelector } from "@/pkgs/client/components/MetricSelector"
import { notFound } from "next/navigation"

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

function generatePageTitle(metricDef: MetricDefinitionRecord) {
  const isBenchmarkMetric = metricDef.metricType === "benchmark"
  return `GPUs Ranked by $ per ${metricDef.unit} ${isBenchmarkMetric ? `in ${metricDef.name}` : ""}`
}

function generatePageSummary(metricDef: MetricDefinitionRecord) {
  const isBenchmarkMetric = metricDef.metricType === "benchmark"
  return `cost ratios of price to performance using a combination of real-time pricing data collected throughout the day and ${isBenchmarkMetric ? "recent real-world crowd-sourced benchmarks for GPUs" : "researched performance specifications for the GPU"}.`
}

type RankingParams = {
  params: Promise<{ category: string; metric: string }>
}

export async function generateMetadata(props: RankingParams) {
  const params = await props.params
  const { category, metric: metricSlug } = params
  const categoryTyped = category as "ai" | "gaming"
  const domain_url = `https://${ISOMORPHIC_CONFIG.PUBLIC_DOMAIN()}`

  const metricDef = await getMetricDefinitionBySlug(metricSlug)
  if (!metricDef) {
    return { title: "Not Found" }
  }

  const title = generatePageTitle(metricDef)
  const description = `Best GPUs for the money with ${generatePageSummary(metricDef)}`

  return {
    title,
    description,
    alternates: {
      canonical: `${domain_url}/gpu/ranking/${categoryTyped}/${metricSlug}`,
    },
  }
}

export default async function Page(props: RankingParams) {
  const params = await props.params
  const { category, metric: metricSlug } = params
  const categoryTyped = category as "ai" | "gaming"

  // Fetch metric definition and all definitions for selector in parallel
  const [metricDef, allMetricDefinitions] = await Promise.all([
    getMetricDefinitionBySlug(metricSlug),
    getAllMetricDefinitions(),
  ])

  if (!metricDef) {
    notFound()
  }

  // Fetch GPU price stats, percentiles, metric values, and all gaming benchmarks in parallel
  const [unsortedPricedGpus, percentileMap, valueMap, gamingBenchmarkValues] =
    await Promise.all([
      calculateGpuPriceStats(),
      calculateAllGpuPercentilesForMetric(metricSlug),
      getMetricValuesBySlug(metricSlug),
      getAllMetricValuesForCategory("gaming"),
    ])

  // Merge percentile, metric value, and benchmark data into PricedGpu objects
  const gpusWithPercentiles = unsortedPricedGpus.map((pricedGpu) => ({
    ...pricedGpu,
    percentile: percentileMap.get(pricedGpu.gpu.name),
    metricValue: valueMap.get(pricedGpu.gpu.name),
    // Convert Map to plain object for serialization to client
    benchmarkValues: Object.fromEntries(
      gamingBenchmarkValues.get(pricedGpu.gpu.name) ?? new Map(),
    ),
  }))

  // Prepare metric definitions for the selector (only the fields needed)
  const metricDefinitionsForSelector = allMetricDefinitions.map((m) => ({
    slug: m.slug,
    name: m.name,
    category: m.category,
    metricType: m.metricType,
    descriptionDollarsPer: m.descriptionDollarsPer,
  }))

  // Gaming benchmark definitions for filters (available on all pages)
  const gamingBenchmarkDefs = allMetricDefinitions
    .filter((m) => m.category === "gaming")
    .map((m) => ({
      slug: m.slug,
      name: m.name,
      unit: m.unitShortest,
    }))

  return (
    <>
      <h1>{generatePageTitle(metricDef)}</h1>
      <p>This page shows {generatePageSummary(metricDef)}</p>
      <p>
        Something missing? <Link href="/contact">Let us know</Link> and
        we&apos;ll add it if we can.
      </p>
      <MetricSelector
        currentMetricSlug={metricSlug}
        metricDefinitions={metricDefinitionsForSelector}
        currentCategory={categoryTyped}
        basePath="/gpu/ranking"
      />
      <Suspense fallback={<div>Loading filters...</div>}>
        <RankingPageWithFilters
          metricUnit={metricDef.unitShortest}
          gpusInitial={gpusWithPercentiles}
          metricInfo={{
            name: metricDef.name,
            unit: metricDef.unitShortest,
            slug: metricDef.slug,
          }}
          gamingBenchmarks={gamingBenchmarkDefs}
        />
      </Suspense>
    </>
  )
}
