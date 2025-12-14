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
export interface GamingBenchmarkDef {
  slug: string
  name: string
  unit: string
}

/** Extended PricedGpu with benchmark values for filtering */
export interface PricedGpuWithBenchmarks extends PricedGpu {
  benchmarkValues?: Record<string, number>
}

interface RankingPageWithFiltersProps {
  gpusInitial: PricedGpuWithBenchmarks[]
  metricUnit: string
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
export function RankingPageWithFilters({
  gpusInitial,
  metricUnit,
  metricInfo,
  gamingBenchmarks,
}: RankingPageWithFiltersProps): JSX.Element {
  const searchParams = useSearchParams()

  // Parse initial filter state from URL
  const initialFilters = useMemo(
    () => parseFiltersFromURL(searchParams),
    [searchParams],
  )

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
