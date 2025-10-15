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

interface DataTablesProps {
  priceHistory: PriceHistoryPoint[]
  availabilityTrends: AvailabilityStats[]
}

const TOP_10 = 10

export default function DataTables({
  priceHistory,
  availabilityTrends,
}: DataTablesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price History Table */}
      <div className="p-6 rounded-lg shadow border">
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
              {priceHistory.slice(0, TOP_10).map((point, index) => (
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
          {priceHistory.length > TOP_10 && (
            <p className="text-gray-500 text-sm mt-2">
              Showing first {TOP_10} of {priceHistory.length} entries
            </p>
          )}
        </div>
      </div>

      {/* Availability Trends Table */}
      <div className="p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Availability Trends Data</h3>
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
              {availabilityTrends.slice(0, TOP_10).map((point, index) => (
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
          {availabilityTrends.length > TOP_10 && (
            <p className="text-gray-500 text-sm mt-2">
              Showing first {TOP_10} of {availabilityTrends.length} entries
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
