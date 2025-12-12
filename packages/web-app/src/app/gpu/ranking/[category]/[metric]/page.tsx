import Link from "next/link"
import {
  calculateGpuPriceStats,
  calculateAllGpuPercentilesForMetric,
  getMetricDefinitionBySlug,
  getMetricValuesBySlug,
  getAllMetricDefinitions,
} from "@/pkgs/server/db/GpuRepository"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { GpuMetricsTable } from "./GpuMetricsTable"
import { MetricSelector } from "@/pkgs/client/components/MetricSelector"
import { notFound } from "next/navigation"

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

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

  const title = `GPUs Ranked by $ / ${metricDef.name}`
  const description = `Best GPUs for the money with performance specifications ranked by the $ per ${metricDef.name} cost-performance ratio.`

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

  // Fetch GPU price stats, percentiles, and metric values in parallel
  const [unsortedPricedGpus, percentileMap, valueMap] = await Promise.all([
    calculateGpuPriceStats(),
    calculateAllGpuPercentilesForMetric(metricSlug),
    getMetricValuesBySlug(metricSlug),
  ])

  // Merge percentile and metric value data into PricedGpu objects
  const gpusWithPercentiles = unsortedPricedGpus.map((pricedGpu) => ({
    ...pricedGpu,
    percentile: percentileMap.get(pricedGpu.gpu.name),
    metricValue: valueMap.get(pricedGpu.gpu.name),
  }))

  const isBenchmarkMetric = metricDef.metricType === "benchmark"

  // Prepare metric definitions for the selector (only the fields needed)
  const metricDefinitionsForSelector = allMetricDefinitions.map((m) => ({
    slug: m.slug,
    name: m.name,
    category: m.category,
    metricType: m.metricType,
    descriptionDollarsPer: m.descriptionDollarsPer,
  }))

  return (
    <>
      <h1>GPUs Ranked by Cost per {metricDef.name}</h1>
      <p>
        This page shows cost ratios of price to performance using a combination
        of real-time pricing data collected throughout the day and{" "}
        {isBenchmarkMetric
          ? "recent real-world crowd-sourced benchmarks for GPUs"
          : "researched performance specifications for the GPU"}
        .
      </p>
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
      <GpuMetricsTable
        metricUnit={metricDef.unitShortest}
        gpusInitial={gpusWithPercentiles}
      />
    </>
  )
}
