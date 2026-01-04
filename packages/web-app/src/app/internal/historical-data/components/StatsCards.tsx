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
    <div className="row g-3 mb-4">
      <div className="col-md-3 col-sm-6">
        <div className="card h-100">
          <div className="card-body">
            <h6 className="card-subtitle mb-2 text-muted">Volatility Score</h6>
            <p className="card-title h3 mb-0 text-primary">
              {volatilityStats.volatilityScore?.toFixed(
                VOLATILITY_SCORE_PRECISION_DIGITS,
              ) || "0.000"}
            </p>
          </div>
        </div>
      </div>
      <div className="col-md-3 col-sm-6">
        <div className="card h-100">
          <div className="card-body">
            <h6 className="card-subtitle mb-2 text-muted">Price Range</h6>
            <p className="card-title h3 mb-0 text-success">
              ${volatilityStats.priceRange?.toFixed(0) || "N/A"}
            </p>
          </div>
        </div>
      </div>
      <div className="col-md-3 col-sm-6">
        <div className="card h-100">
          <div className="card-body">
            <h6 className="card-subtitle mb-2 text-muted">Version Count</h6>
            <p className="card-title h3 mb-0 text-info">
              {volatilityStats.versionCount || 0}
            </p>
          </div>
        </div>
      </div>
      <div className="col-md-3 col-sm-6">
        <div className="card h-100">
          <div className="card-body">
            <h6 className="card-subtitle mb-2 text-muted">Data Points</h6>
            <p className="card-title h3 mb-0 text-warning">{dataPointsCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
