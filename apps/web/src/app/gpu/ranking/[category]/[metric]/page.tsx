import {
  GpuMetricsDescription,
  getMetricsByCategory,
  isBenchmark,
} from "@/pkgs/isomorphic/model"
import {
  RankingSlug,
  rankingCanonicalPath,
  rankingDescription,
  rankingTitle,
  mapSlugToMetric,
} from "../../slugs"
import Link from "next/link"
import { calculateGpuPriceStats } from "@/pkgs/server/db/GpuRepository"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { GpuMetricsTable } from "./GpuMetricsTable"

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

type RankingParams = {
  params: Promise<{ category: string; metric: string }>
}

export async function generateMetadata(props: RankingParams) {
  const params = await props.params
  const { category, metric } = params
  const categoryTyped = category as "ai" | "gaming"
  const metricTyped = metric as RankingSlug
  const domain_url = `https://${ISOMORPHIC_CONFIG.PUBLIC_DOMAIN()}`

  return {
    title: rankingTitle(metricTyped, categoryTyped),
    description: rankingDescription(metricTyped, categoryTyped),
    alternates: {
      canonical: `${domain_url}${rankingCanonicalPath(metricTyped, categoryTyped)}`,
    },
  }
}

export default async function Page(props: RankingParams) {
  const params = await props.params
  const { category, metric } = params
  const categoryTyped = category as "ai" | "gaming"
  const metricTyped = metric as RankingSlug
  const primaryMetric = mapSlugToMetric(metricTyped, categoryTyped)
  const desc = GpuMetricsDescription[primaryMetric]

  const unsortedPricedGpus = await calculateGpuPriceStats()

  // Get all metrics for this category
  const categoryMetrics = getMetricsByCategory(categoryTyped)

  return (
    <>
      <h1>GPUs Ranked by Cost per {desc.label}</h1>
      <p>
        This page shows cost ratios of price to performance using a combination
        of real-time pricing data collected throughout the day and{" "}
        {isBenchmark(primaryMetric)
          ? "recent real-world crowd-sourced benchmarks for GPUs"
          : "researched performance specifications for the GPU"}
        .
      </p>
      <p>
        Something missing? <Link href="/contact">Let us know</Link> and
        we&apos;ll add it if we can.
      </p>
      <GpuMetricsTable
        primaryMetricInitial={primaryMetric}
        gpusInitial={unsortedPricedGpus}
        metricsToShow={categoryMetrics}
      />
    </>
  )
}
