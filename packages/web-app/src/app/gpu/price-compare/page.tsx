import { Suspense } from "react"
import { listActiveListings } from "@/pkgs/server/db/ListingRepository"
import {
  getAllMetricDefinitions,
  getAllMetricValuesForCategory,
} from "@/pkgs/server/db/GpuRepository"
import { AllGpusWithFilters } from "./AllGpusWithFilters"

// revalidate the data at most every hour
export const revalidate = 3600

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return {
    title: "Shop All GPUs - Compare Prices with Performance Filters",
    description:
      "Browse all available GPUs with real-time eBay prices. Filter by price, memory, architecture, and gaming benchmarks to find the perfect GPU for your budget.",
    alternates: {
      canonical: "https://gpupoet.com/gpu/price-compare",
    },
  }
}

export default async function Page() {
  // Fetch all active listings and gaming benchmark values in parallel
  const [allListings, allMetricDefinitions, gamingBenchmarkValues] =
    await Promise.all([
      listActiveListings(),
      getAllMetricDefinitions(),
      getAllMetricValuesForCategory("gaming"),
    ])

  // Sort listings by price (lowest first) for better initial view
  const sortedListings = [...allListings].sort(
    (a, b) => Number(a.priceValue) - Number(b.priceValue),
  )

  // Map listings and attach benchmark values for filtering
  const mapped = sortedListings.map((listing) => ({
    item: listing,
    benchmarkValues: Object.fromEntries(
      gamingBenchmarkValues.get(listing.gpu.name) ?? new Map(),
    ),
  }))

  // Build gaming benchmark definitions for the filter
  const gamingBenchmarkDefs = allMetricDefinitions
    .filter((m) => m.category === "gaming")
    .map((m) => ({ slug: m.slug, name: m.name, unit: m.unitShortest }))

  return (
    <>
      <div className="mb-4">
        <h1>Shop All GPUs</h1>
        <p className="lead">
          Find your perfect GPU from real-time eBay listings. Use the filters to
          narrow down by price, memory, architecture, and gaming benchmark
          performance. This combines live market prices with real-world
          performance data to help you find the best value.
        </p>
      </div>
      <Suspense fallback={<div>Loading filters...</div>}>
        <AllGpusWithFilters
          listings={mapped}
          gamingBenchmarks={gamingBenchmarkDefs}
        />
      </Suspense>
    </>
  )
}
