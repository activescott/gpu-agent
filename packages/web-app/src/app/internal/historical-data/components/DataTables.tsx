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

interface DataTablesProps {
  priceHistory: PriceHistoryPoint[]
  availabilityTrends: AvailabilityStats[]
}

export default function DataTables({
  priceHistory,
  availabilityTrends,
}: DataTablesProps) {
  return (
    <div className="row g-4">
      {/* Price History Table */}
      <div className="col-lg-6">
        <div className="card h-100">
          <div className="card-header">
            <h5 className="card-title mb-0">Price History Data</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Median</th>
                    <th>Lowest Avg</th>
                    <th>Listings</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.map((point, index) => (
                    <tr key={index}>
                      <td>{new Date(point.date).toLocaleDateString()}</td>
                      <td>${point.medianPrice.toFixed(0)}</td>
                      <td>${point.lowestAvgPrice.toFixed(0)}</td>
                      <td>{point.listingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Trends Table */}
      <div className="col-lg-6">
        <div className="card h-100">
          <div className="card-header">
            <h5 className="card-title mb-0">Availability Trends Data</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Listings</th>
                    <th>Sellers</th>
                    <th>Avg Days</th>
                  </tr>
                </thead>
                <tbody>
                  {availabilityTrends.map((point, index) => (
                    <tr key={index}>
                      <td>{new Date(point.date).toLocaleDateString()}</td>
                      <td>{point.availableListings}</td>
                      <td>{point.uniqueSellers}</td>
                      <td>{point.avgDaysListed?.toFixed(1) || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
