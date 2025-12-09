"use client"
import { MetricSelector } from "@/pkgs/client/components/MetricSelector"
import { getMetricCategory, GpuMetricKey } from "@/pkgs/isomorphic/model"
import { metricToSlug } from "../../slugs"

interface RankingMetricSelectorProps {
  currentMetric: GpuMetricKey
}

function metricToHref(m: GpuMetricKey): string | undefined {
  const category = getMetricCategory(m)
  const slug = metricToSlug(m, category)
  if (!slug) return undefined
  return `/gpu/ranking/${category}/${slug}`
}

/**
 * Client-side wrapper for MetricSelector on ranking pages.
 *
 * This wrapper exists because MetricSelector requires a function prop (metricToHref),
 * and functions cannot be passed from Server Components to Client Components.
 * By defining the function in this client component, we avoid the serialization issue.
 */
export function RankingMetricSelector({
  currentMetric,
}: RankingMetricSelectorProps) {
  return (
    <MetricSelector currentMetric={currentMetric} metricToHref={metricToHref} />
  )
}
