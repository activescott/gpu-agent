interface VolatilityStats {
  gpuName: string
  volatilityScore: number
  priceRange: number
  versionCount: number
}

interface StatsCardsProps {
  volatilityStats: VolatilityStats
  dataPointsCount: number
}

const VOLATILITY_SCORE_PRECISION_DIGITS = 3

export default function StatsCards({
  volatilityStats,
  dataPointsCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-2">Volatility Score</h3>
        <p className="text-2xl font-bold text-blue-600">
          {volatilityStats.volatilityScore?.toFixed(
            VOLATILITY_SCORE_PRECISION_DIGITS,
          ) || "0.000"}
        </p>
      </div>
      <div className="p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-2">Price Range</h3>
        <p className="text-2xl font-bold text-green-600">
          ${volatilityStats.priceRange?.toFixed(0) || "N/A"}
        </p>
      </div>
      <div className="p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-2">Version Count</h3>
        <p className="text-2xl font-bold text-purple-600">
          {volatilityStats.versionCount || 0}
        </p>
      </div>
      <div className="p-4 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-2">Data Points</h3>
        <p className="text-2xl font-bold text-orange-600">{dataPointsCount}</p>
      </div>
    </div>
  )
}
