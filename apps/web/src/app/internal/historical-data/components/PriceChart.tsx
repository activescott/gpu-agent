import { Line } from "react-chartjs-2"

interface PriceHistoryPoint {
  date: string
  avgPrice: number
  minPrice: number
  maxPrice: number
  listingCount: number
}

interface PriceChartProps {
  priceHistory: PriceHistoryPoint[]
}

export default function PriceChart({ priceHistory }: PriceChartProps) {
  const chartData = {
    labels: priceHistory.map((point) =>
      new Date(point.date).toLocaleDateString(),
    ),
    datasets: [
      {
        label: "Average Price",
        data: priceHistory.map((point) => point.avgPrice),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
      {
        label: "Min Price",
        data: priceHistory.map((point) => point.minPrice),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
      },
      {
        label: "Max Price",
        data: priceHistory.map((point) => point.maxPrice),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
      },
    ],
  }

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
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-semibold mb-4">Price History</h2>
      <Line data={chartData} options={chartOptions} />
    </div>
  )
}
