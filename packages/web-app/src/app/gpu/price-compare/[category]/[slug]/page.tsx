import { Suspense } from "react"
import { topNListingsByCostPerformanceBySlug } from "@/pkgs/server/db/ListingRepository"
import {
  getAllMetricDefinitions,
  getMetricDefinitionBySlug,
  getAllMetricValuesForCategory,
} from "@/pkgs/server/db/GpuRepository"
import { MetricSelector } from "@/pkgs/client/components/MetricSelector"
import { PriceCompareWithFilters } from "./PriceCompareWithFilters"
import { createLogger } from "@/lib/logger"
import { notFound } from "next/navigation"

const log = createLogger("gpu:price-compare:category:slug")

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

type CostPerMetricParams = {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata(props: CostPerMetricParams) {
  const params = await props.params
  const { category, slug } = params

  log.debug({ category, slug }, "generateMetadata for category")

  // Look up metric definition from database - uses slug directly with GpuMetricValue
  const metricDef = await getMetricDefinitionBySlug(slug)
  if (!metricDef) {
    return {
      title: "Not Found",
      description: "Metric not found",
    }
  }

  const title = `Compare GPU Prices by ${metricDef.name}`
  const description =
    metricDef.descriptionDollarsPer || `Compare GPU Prices by ${metricDef.name}`

  return {
    title,
    description,
    alternates: {
      canonical: `https://gpupoet.com/gpu/price-compare/${category}/${slug}`,
    },
  }
}

export default async function Page(props: CostPerMetricParams) {
  const params = await props.params
  const { category, slug } = params

  // Look up metric definition from database - uses slug directly with GpuMetricValue
  const metricDef = await getMetricDefinitionBySlug(slug)
  if (!metricDef) {
    log.warn(`Unknown metric slug: ${slug} for category: ${category}`)
    notFound()
  }

  // Verify category matches (optional validation)
  if (metricDef.category !== category) {
    log.warn(
      `Metric ${slug} belongs to category ${metricDef.category}, not ${category}`,
    )
    // We allow it but could redirect if needed
  }

  // Fetch listings and gaming benchmark values in parallel
  const TOP_N = 100
  const [topListings, allMetricDefinitions, gamingBenchmarkValues] =
    await Promise.all([
      topNListingsByCostPerformanceBySlug(slug, TOP_N),
      getAllMetricDefinitions(),
      getAllMetricValuesForCategory("gaming"),
    ])

  // Map listings and attach benchmark values for filtering
  const mapped = topListings.map((listing) => ({
    item: listing,
    // Look up benchmark values by GPU name
    benchmarkValues: Object.fromEntries(
      gamingBenchmarkValues.get(listing.gpu.name) ?? new Map(),
    ),
  }))

  // Build gaming benchmark definitions for the filter
  const gamingBenchmarkDefs = allMetricDefinitions
    .filter((m) => m.category === "gaming")
    .map((m) => ({ slug: m.slug, name: m.name, unit: m.unitShortest }))

  // Prepare metric definitions for the selector
  // All metrics with values in GpuMetricValue are now supported
  const metricDefinitionsForSelector = allMetricDefinitions.map((m) => ({
    slug: m.slug,
    name: m.name,
    category: m.category,
    metricType: m.metricType,
    descriptionDollarsPer: m.descriptionDollarsPer,
  }))

  const categoryTyped = category as "ai" | "gaming"

  // Build metric info for the gallery component
  const metricInfo = {
    slug: metricDef.slug,
    name: metricDef.name,
    category: metricDef.category as "ai" | "gaming",
    unit: metricDef.unit,
    unitShortest: metricDef.unitShortest,
    descriptionDollarsPer: metricDef.descriptionDollarsPer,
  }

  return (
    <>
      <MetricSelector
        currentMetricSlug={slug}
        metricDefinitions={metricDefinitionsForSelector}
        currentCategory={categoryTyped}
        basePath="/gpu/price-compare"
      />
      <Suspense fallback={<div>Loading filters...</div>}>
        <PriceCompareWithFilters
          listings={mapped}
          metricInfo={metricInfo}
          gamingBenchmarks={gamingBenchmarkDefs}
        />
      </Suspense>
    </>
  )
}
