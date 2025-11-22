"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

import ControlPanel from "./components/ControlPanel"
import StatsCards from "./components/StatsCards"
import PriceChart from "./components/PriceChart"
import AvailabilityChart from "./components/AvailabilityChart"
import DataTables from "./components/DataTables"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

interface PriceHistoryPoint {
  date: string
  avgPrice: number
  minPrice: number
  maxPrice: number
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

  if (gpuLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading GPU options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Historical Data Testing Page</h1>
      <p className="text-gray-600 mb-8">
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading historical data...</p>
        </div>
      )}

      {/* Data Display */}
      {data && !loading && (
        <div className="space-y-8">
          <StatsCards
            volatilityStats={data.volatilityStats}
            dataPointsCount={data.priceHistory.length}
          />

          <PriceChart priceHistory={data.priceHistory} />

          <AvailabilityChart availabilityTrends={data.availabilityTrends} />

          <DataTables
            priceHistory={data.priceHistory}
            availabilityTrends={data.availabilityTrends}
          />
        </div>
      )}
    </div>
  )
}
