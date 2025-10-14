"use client"

import { useState, useEffect, useCallback } from "react"
import { Line, Bar } from "react-chartjs-2"
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

const VOLATILITY_SCORE_PRECISION_DIGITS = 3
const TOP_10 = 10

// eslint-disable-next-line complexity
export default function HistoricalDataPage() {
  const [selectedGpu, setSelectedGpu] = useState("RTX 4090")
  const [months, setMonths] = useState(6) // eslint-disable-line no-magic-numbers
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<HistoricalData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Common GPU names for testing
  const commonGpus = [
    "RTX 4090",
    "RTX 4080",
    "RTX 4070",
    "RTX 3090",
    "RTX 3080",
    "RTX 3070",
    "RX 7900 XTX",
    "RX 6800 XT",
  ]

  const fetchHistoricalData = useCallback(async () => {
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
    fetchHistoricalData()
  }, [selectedGpu, months, fetchHistoricalData])

  const priceChartData = data
    ? {
        labels: data.priceHistory.map((point) =>
          new Date(point.date).toLocaleDateString(),
        ),
        datasets: [
          {
            label: "Average Price",
            data: data.priceHistory.map((point) => point.avgPrice),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.1,
          },
          {
            label: "Min Price",
            data: data.priceHistory.map((point) => point.minPrice),
            borderColor: "rgb(54, 162, 235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            tension: 0.1,
          },
          {
            label: "Max Price",
            data: data.priceHistory.map((point) => point.maxPrice),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            tension: 0.1,
          },
        ],
      }
    : null

  const availabilityChartData = data
    ? {
        labels: data.availabilityTrends.map((point) =>
          new Date(point.date).toLocaleDateString(),
        ),
        datasets: [
          {
            label: "Available Listings",
            data: data.availabilityTrends.map(
              (point) => point.availableListings,
            ),
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
          {
            label: "Unique Sellers",
            data: data.availabilityTrends.map((point) => point.uniqueSellers),
            backgroundColor: "rgba(255, 159, 64, 0.2)",
            borderColor: "rgba(255, 159, 64, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Historical Data Testing Page</h1>
      <p className="text-gray-600 mb-8">
        This page is for internal testing of historical data functions. It is
        not linked anywhere and not in the sitemap.
      </p>

      {/* Controls */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPU Name
            </label>
            <select
              value={selectedGpu}
              onChange={(e) => setSelectedGpu(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {commonGpus.map((gpu) => (
                <option key={gpu} value={gpu}>
                  {gpu}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Months of History
            </label>
            <select
              value={months}
              onChange={(e) => setMonths(Number.parseInt(e.target.value, 10))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>1 Month</option>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchHistoricalData}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>

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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-2">Volatility Score</h3>
              <p className="text-2xl font-bold text-blue-600">
                {data.volatilityStats.volatilityScore?.toFixed(
                  VOLATILITY_SCORE_PRECISION_DIGITS,
                ) || "0.000"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-2">Price Range</h3>
              <p className="text-2xl font-bold text-green-600">
                ${data.volatilityStats.priceRange?.toFixed(0) || "N/A"}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-2">Version Count</h3>
              <p className="text-2xl font-bold text-purple-600">
                {data.volatilityStats.versionCount || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-2">Data Points</h3>
              <p className="text-2xl font-bold text-orange-600">
                {data.priceHistory.length}
              </p>
            </div>
          </div>

          {/* Price History Chart */}
          {priceChartData && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4">Price History</h2>
              <Line data={priceChartData} options={chartOptions} />
            </div>
          )}

          {/* Availability Trends Chart */}
          {availabilityChartData && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4">
                Availability Trends
              </h2>
              <Bar data={availabilityChartData} options={chartOptions} />
            </div>
          )}

          {/* Raw Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price History Table */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Price History Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Avg Price</th>
                      <th className="text-left p-2">Min Price</th>
                      <th className="text-left p-2">Max Price</th>
                      <th className="text-left p-2">Listings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.priceHistory.slice(0, TOP_10).map((point, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          {new Date(point.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">${point.avgPrice.toFixed(0)}</td>
                        <td className="p-2">${point.minPrice.toFixed(0)}</td>
                        <td className="p-2">${point.maxPrice.toFixed(0)}</td>
                        <td className="p-2">{point.listingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.priceHistory.length > TOP_10 && (
                  <p className="text-gray-500 text-sm mt-2">
                    Showing first {TOP_10} of {data.priceHistory.length} entries
                  </p>
                )}
              </div>
            </div>

            {/* Availability Trends Table */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">
                Availability Trends Data
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Listings</th>
                      <th className="text-left p-2">Sellers</th>
                      <th className="text-left p-2">Avg Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.availabilityTrends
                      .slice(0, TOP_10)
                      .map((point, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            {new Date(point.date).toLocaleDateString()}
                          </td>
                          <td className="p-2">{point.availableListings}</td>
                          <td className="p-2">{point.uniqueSellers}</td>
                          <td className="p-2">
                            {point.avgDaysListed?.toFixed(1) || "N/A"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {data.availabilityTrends.length > TOP_10 && (
                  <p className="text-gray-500 text-sm mt-2">
                    Showing first {TOP_10} of {data.availabilityTrends.length}{" "}
                    entries
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
