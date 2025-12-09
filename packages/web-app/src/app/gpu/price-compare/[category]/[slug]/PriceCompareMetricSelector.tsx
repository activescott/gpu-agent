"use client"
import { MetricSelector } from "@/pkgs/client/components/MetricSelector"
import { getMetricCategory, GpuMetricKey } from "@/pkgs/isomorphic/model"
import { mapMetricToSlug } from "../../slugs"

interface PriceCompareMetricSelectorProps {
  currentMetric: GpuMetricKey
}

function metricToHref(m: GpuMetricKey): string | undefined {
  const slug = mapMetricToSlug(m)
  const category = getMetricCategory(m)
  return `/gpu/price-compare/${category}/${slug}`
}

/**
 * Client-side wrapper for MetricSelector on price-compare pages.
 *
 * This wrapper exists because MetricSelector requires a function prop (metricToHref),
 * and functions cannot be passed from Server Components to Client Components.
 * By defining the function in this client component, we avoid the serialization issue.
 */
export function PriceCompareMetricSelector({
  currentMetric,
}: PriceCompareMetricSelectorProps) {
  return (
    <MetricSelector currentMetric={currentMetric} metricToHref={metricToHref} />
  )
}
