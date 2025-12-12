"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type JSX } from "react"

/**
 * Metric definition type for the selector.
 * This is a plain object that can be serialized from server to client.
 */
interface MetricDefinitionForSelector {
  slug: string
  name: string
  category: string // "ai" | "gaming"
  metricType: string // "spec" | "benchmark"
  descriptionDollarsPer: string
}

interface MetricSelectorProps {
  /** The slug of the currently selected metric */
  currentMetricSlug: string
  /** All available metric definitions from the database */
  metricDefinitions: MetricDefinitionForSelector[]
  /** The category that the current page belongs to (determines URL structure) */
  currentCategory: "ai" | "gaming"
  /** Base path for generating links (e.g., "/gpu/ranking" or "/gpu/price-compare") */
  basePath: string
}

type CategoryGroup =
  | "ai-specs"
  | "ai-benchmarks"
  | "gaming-specs"
  | "gaming-benchmarks"

/**
 * A data-driven metric selector that works with database-loaded metric definitions.
 * Receives all metric data as props from the server component.
 */
export function MetricSelector({
  currentMetricSlug,
  metricDefinitions,
  currentCategory,
  basePath,
}: MetricSelectorProps): JSX.Element {
  const router = useRouter()

  // Filter metrics by category and type
  const aiSpecs = metricDefinitions.filter(
    (m) => m.category === "ai" && m.metricType === "spec",
  )
  const aiBenchmarks = metricDefinitions.filter(
    (m) => m.category === "ai" && m.metricType === "benchmark",
  )
  const gamingSpecs = metricDefinitions.filter(
    (m) => m.category === "gaming" && m.metricType === "spec",
  )
  const gamingBenchmarks = metricDefinitions.filter(
    (m) => m.category === "gaming" && m.metricType === "benchmark",
  )

  // Find the current metric definition
  const currentMetric = metricDefinitions.find(
    (m) => m.slug === currentMetricSlug,
  )

  // Determine which category group the current metric belongs to
  const getCurrentCategoryGroup = (): CategoryGroup => {
    if (!currentMetric) return `${currentCategory}-specs` as CategoryGroup
    const isSpec = currentMetric.metricType === "spec"
    const category = currentMetric.category as "ai" | "gaming"
    if (category === "ai") {
      return isSpec ? "ai-specs" : "ai-benchmarks"
    }
    return isSpec ? "gaming-specs" : "gaming-benchmarks"
  }

  const [activeCategoryGroup, setActiveCategoryGroup] = useState<CategoryGroup>(
    getCurrentCategoryGroup(),
  )

  // Get metrics for the active category group
  const getMetricsForCategory = (
    categoryGroup: CategoryGroup,
  ): MetricDefinitionForSelector[] => {
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

  // Generate href for a metric
  const metricToHref = (metric: MetricDefinitionForSelector): string => {
    return `${basePath}/${metric.category}/${metric.slug}`
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
        const href = metricToHref(firstMetric)
        router.push(href)
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

  // eslint-disable-next-line react/prop-types -- TypeScript handles prop validation
  const MetricLink = ({ metric }: { metric: MetricDefinitionForSelector }) => {
    const isActive = metric.slug === currentMetricSlug
    const href = metricToHref(metric)

    return (
      <li className="nav-item">
        <Link
          href={href}
          className={`nav-link ${isActive ? "active" : ""}`}
          aria-current={isActive ? "page" : undefined}
        >
          {metric.name}
        </Link>
      </li>
    )
  }

  return (
    <div className="w-100 mb-3 py-2 px-3">
      <div className="mb-2 small fw-semibold">Compare GPUs by metric:</div>

      {/* Category Group Navigation */}
      <ul className="nav nav-underline mb-3 flex-nowrap">
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
      <div className="overflow-x-scroll">
        <ul className="nav nav-underline mb-2 flex-nowrap">
          {activeMetrics.map((metric) => (
            // eslint-disable-next-line react/prop-types -- TypeScript handles prop validation
            <MetricLink key={metric.slug} metric={metric} />
          ))}
        </ul>
      </div>

      {/* Description of current metric */}
      {currentMetric && (
        <div className="mt-2 small text-muted">
          {currentMetric.descriptionDollarsPer}
        </div>
      )}
    </div>
  )
}
