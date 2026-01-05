"use client"

import { useState, useEffect, useCallback } from "react"

import ControlPanel from "./components/ControlPanel"
import StatsCards from "./components/StatsCards"
import PriceChart from "./components/PriceChart"
import AvailabilityChart from "./components/AvailabilityChart"
import DataTables from "./components/DataTables"

interface PriceHistoryPoint {
  date: string
  lowestAvgPrice: number
  medianPrice: number
  listingCount: number
}

interface AvailabilityStats {
  date: string
  availableListings: number
  uniqueSellers: number
  avgDaysListed: number
}

interface VolatilityStats {
  gpuName: string
  volatilityScore: number
  priceRange: number
  versionCount: number
}

interface HistoricalData {
  gpuName: string
  months: number
  priceHistory: PriceHistoryPoint[]
  availabilityTrends: AvailabilityStats[]
  volatilityStats: VolatilityStats
}

export default function HistoricalDataPage() {
  const [selectedGpu, setSelectedGpu] = useState("")
  const [months, setMonths] = useState(6) // eslint-disable-line no-magic-numbers
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<HistoricalData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gpuOptions, setGpuOptions] = useState<
    Array<{ name: string; label: string }>
  >([])
  const [gpuLoading, setGpuLoading] = useState(true)

  const fetchGpuOptions = useCallback(async () => {
    try {
      const response = await fetch("/internal/api/gpus")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const gpus = await response.json()
      setGpuOptions(gpus)
      if (gpus.length > 0 && !selectedGpu) {
        setSelectedGpu(gpus[0].name)
      }
    } catch (error_) {
      setError(
        error_ instanceof Error
          ? error_.message
          : "Failed to fetch GPU options",
      )
    } finally {
      setGpuLoading(false)
    }
  }, [selectedGpu])

  const fetchHistoricalData = useCallback(async () => {
    if (!selectedGpu) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/internal/api/historical/${encodeURIComponent(selectedGpu)}?months=${months}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [selectedGpu, months])

  useEffect(() => {
    fetchGpuOptions()
  }, [fetchGpuOptions])

  useEffect(() => {
    if (selectedGpu) {
      fetchHistoricalData()
    }
  }, [selectedGpu, months, fetchHistoricalData])

  // Get the label for the selected GPU
  const selectedGpuLabel = gpuOptions.find((g) => g.name === selectedGpu)?.label

  if (gpuLoading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading GPU options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="mb-2">Historical Data Testing Page</h1>
      <p className="text-muted mb-4">
        This page is for internal testing of historical data functions. It is
        not linked anywhere and not in the sitemap.
      </p>

      <ControlPanel
        selectedGpu={selectedGpu}
        setSelectedGpu={setSelectedGpu}
        months={months}
        setMonths={setMonths}
        loading={loading}
        onRefresh={fetchHistoricalData}
        gpuOptions={gpuOptions}
      />

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading historical data...</p>
        </div>
      )}

      {/* Data Display */}
      {data && !loading && (
        <>
          <StatsCards
            volatilityStats={data.volatilityStats}
            dataPointsCount={data.priceHistory.length}
          />

          <div className="mb-4">
            <PriceChart
              priceHistory={data.priceHistory}
              gpuName={selectedGpuLabel}
            />
          </div>

          <div className="mb-4">
            <AvailabilityChart
              availabilityTrends={data.availabilityTrends}
              gpuName={selectedGpuLabel}
            />
          </div>

          <DataTables
            priceHistory={data.priceHistory}
            availabilityTrends={data.availabilityTrends}
          />
        </>
      )}
    </div>
  )
}
