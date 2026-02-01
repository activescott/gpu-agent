"use client"

import { useState, useCallback, useMemo, type JSX } from "react"
import { useSearchParams } from "next/navigation"
import {
  FilterItems,
  FilterLayout,
  parseFiltersFromURL,
  updateURLWithFilters,
  applyFilters,
  type FilterConfig,
  type FilterState,
} from "@/components/filter-items"
import {
  buildGpuFilterConfigs,
  getGpuFieldValue,
} from "@/components/gpu/gpuFilterConfig"
import type { PricedGpu } from "@/pkgs/server/db/GpuRepository"
import { GpuMetricsTable } from "./GpuMetricsTable"

/** Gaming benchmark definition for filter config */
interface GamingBenchmarkDef {
  slug: string
  name: string
  unit: string
}

/** Extended PricedGpu with benchmark values for filtering */
interface PricedGpuWithBenchmarks extends PricedGpu {
  benchmarkValues?: Record<string, number>
}

interface RankingPageWithFiltersProps {
  gpusInitial: PricedGpuWithBenchmarks[]
  metricUnit: string
  /** The category of rankings (ai or gaming) - affects default filter values */
  category: "ai" | "gaming"
  metricInfo?: {
    name: string
    unit: string
    slug: string
  }
  /** Gaming benchmark definitions for filter options */
  gamingBenchmarks?: GamingBenchmarkDef[]
}

/**
 * Client component wrapper that adds filtering to the ranking page
 */
// Default memory filter threshold for AI pages (in GB)
const AI_DEFAULT_MEMORY_GB = 10

export function RankingPageWithFilters({
  gpusInitial,
  metricUnit,
  category,
  metricInfo,
  gamingBenchmarks,
}: RankingPageWithFiltersProps): JSX.Element {
  const searchParams = useSearchParams()

  // Parse initial filter state from URL, applying category-based defaults
  const initialFilters = useMemo(() => {
    const urlFilters = parseFiltersFromURL(searchParams)

    // For AI pages, default to 10GB minimum memory if no memory filter in URL
    // This filters out lower-memory GPUs that are less suitable for ML workloads
    if (category === "ai" && !("memoryCapacityGB" in urlFilters)) {
      return {
        ...urlFilters,
        memoryCapacityGB: {
          operator: "gte" as const,
          value: AI_DEFAULT_MEMORY_GB,
        },
      }
    }

    return urlFilters
  }, [searchParams, category])

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  // Build filter configs from GPU data
  const filterConfigs = useMemo<FilterConfig[]>(
    () => buildGpuFilterConfigs(gpusInitial, { metricInfo, gamingBenchmarks }),
    [gpusInitial, metricInfo, gamingBenchmarks],
  )

  // Apply filters to GPUs
  const filteredGpus = useMemo(
    () => applyFilters(gpusInitial, filters, getGpuFieldValue),
    [gpusInitial, filters],
  )

  // Handle filter changes - update state and URL
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    updateURLWithFilters(newFilters)
  }, [])

  // Render filter panel
  const filterPanel = (
    <FilterItems
      configs={filterConfigs}
      filters={filters}
      onFilterChange={handleFilterChange}
      title="Filter GPUs"
    />
  )

  return (
    <FilterLayout
      filterPanel={filterPanel}
      filters={filters}
      configs={filterConfigs}
      onFilterChange={handleFilterChange}
    >
      {/* Show filtered count if different from total */}
      {filteredGpus.length !== gpusInitial.length && (
        <div className="text-muted mb-2">
          Showing {filteredGpus.length} of {gpusInitial.length} GPUs
        </div>
      )}
      <GpuMetricsTable metricUnit={metricUnit} gpuList={filteredGpus} />
    </FilterLayout>
  )
}
