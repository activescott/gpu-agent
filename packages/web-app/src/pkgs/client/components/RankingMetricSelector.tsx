"use client"
import {
  GpuMetricKey,
  GpuMetricKeys,
  GpuMetricsDescription,
  isSpec,
  isBenchmark,
  getMetricCategory,
} from "@/pkgs/isomorphic/model"
import { metricToSlug } from "@/app/gpu/ranking/slugs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type JSX } from "react"

interface RankingMetricSelectorProps {
  currentMetric: GpuMetricKey
}

type CategoryGroup =
  | "ai-specs"
  | "ai-benchmarks"
  | "gaming-specs"
  | "gaming-benchmarks"

export function RankingMetricSelector({
  currentMetric,
}: RankingMetricSelectorProps): JSX.Element {
  const router = useRouter()

  // Get all metrics and separate by category and type (using GpuMetricKeys to maintain consistent order)
  const allMetrics = GpuMetricKeys

  const aiSpecs = allMetrics.filter(
    (key) => isSpec(key) && getMetricCategory(key) === "ai",
  )
  const aiBenchmarks = allMetrics.filter(
    (key) => isBenchmark(key) && getMetricCategory(key) === "ai",
  )
  const gamingSpecs = allMetrics.filter(
    (key) => isSpec(key) && getMetricCategory(key) === "gaming",
  )
  const gamingBenchmarks = allMetrics.filter(
    (key) => isBenchmark(key) && getMetricCategory(key) === "gaming",
  )

  // Determine which category group the current metric belongs to
  const getCurrentCategoryGroup = (): CategoryGroup => {
    if (aiSpecs.includes(currentMetric)) return "ai-specs"
    if (aiBenchmarks.includes(currentMetric)) return "ai-benchmarks"
    if (gamingSpecs.includes(currentMetric)) return "gaming-specs"
    if (gamingBenchmarks.includes(currentMetric)) return "gaming-benchmarks"
    return "ai-specs" // default
  }

  const [activeCategoryGroup, setActiveCategoryGroup] = useState<CategoryGroup>(
    getCurrentCategoryGroup(),
  )

  // Get metrics for the active category group
  const getMetricsForCategory = (
    categoryGroup: CategoryGroup,
  ): GpuMetricKey[] => {
    switch (categoryGroup) {
      case "ai-specs": {
        return aiSpecs
      }
      case "ai-benchmarks": {
        return aiBenchmarks
      }
      case "gaming-specs": {
        return gamingSpecs
      }
      case "gaming-benchmarks": {
        return gamingBenchmarks
      }
    }
  }

  const activeMetrics = getMetricsForCategory(activeCategoryGroup)

  const CategoryLink = ({
    categoryGroup,
    label,
  }: {
    categoryGroup: CategoryGroup
    label: string
  }) => {
    const isActive = categoryGroup === activeCategoryGroup

    const handleCategoryClick = () => {
      setActiveCategoryGroup(categoryGroup)
      // Navigate to the first metric in this category
      const metrics = getMetricsForCategory(categoryGroup)
      if (metrics.length > 0) {
        const firstMetric = metrics[0]
        const slug = metricToSlug(firstMetric, getMetricCategory(firstMetric))
        const metricCategory = getMetricCategory(firstMetric)
        if (slug) {
          router.push(`/gpu/ranking/${metricCategory}/${slug}`)
        }
      }
    }

    return (
      <li className="nav-item">
        <button
          className={`nav-link ${isActive ? "active" : ""}`}
          aria-current={isActive ? "page" : undefined}
          onClick={handleCategoryClick}
        >
          {label}
        </button>
      </li>
    )
  }

  const MetricLink = ({ metricKey }: { metricKey: GpuMetricKey }) => {
    const isActive = metricKey === currentMetric
    const slug = metricToSlug(metricKey, getMetricCategory(metricKey))
    const metricCategory = getMetricCategory(metricKey)

    if (!slug) return null

    const href = `/gpu/ranking/${metricCategory}/${slug}`

    return (
      <li className="nav-item">
        <Link
          href={href}
          className={`nav-link ${isActive ? "active" : ""}`}
          aria-current={isActive ? "page" : undefined}
        >
          {GpuMetricsDescription[metricKey].label}
        </Link>
      </li>
    )
  }

  return (
    <div className="w-100 mb-3 py-2 px-3">
      <div className="mb-2 small fw-semibold">Compare GPUs by metric:</div>

      {/* Category Group Navigation */}
      <ul className="nav nav-underline mb-3">
        {aiSpecs.length > 0 && (
          <CategoryLink categoryGroup="ai-specs" label="AI Specs" />
        )}
        {aiBenchmarks.length > 0 && (
          <CategoryLink categoryGroup="ai-benchmarks" label="AI Benchmarks" />
        )}
        {gamingSpecs.length > 0 && (
          <CategoryLink categoryGroup="gaming-specs" label="Gaming Specs" />
        )}
        {gamingBenchmarks.length > 0 && (
          <CategoryLink
            categoryGroup="gaming-benchmarks"
            label="Gaming Benchmarks"
          />
        )}
      </ul>

      {/* Metric Navigation for Selected Category */}
      <ul className="nav nav-underline mb-2">
        {activeMetrics.map((metricKey) => (
          <MetricLink key={metricKey} metricKey={metricKey} />
        ))}
      </ul>

      {/* Description of current metric */}
      <div className="mt-2 small text-muted">
        {GpuMetricsDescription[currentMetric].descriptionDollarsPer}
      </div>
    </div>
  )
}
