import { Bar } from "react-chartjs-2"

interface AvailabilityStats {
  date: string
  availableListings: number
  uniqueSellers: number
  avgDaysListed: number
}

interface AvailabilityChartProps {
  availabilityTrends: AvailabilityStats[]
}

export default function AvailabilityChart({
  availabilityTrends,
}: AvailabilityChartProps) {
  const chartData = {
    labels: availabilityTrends.map((point) =>
      new Date(point.date).toLocaleDateString(),
    ),
    datasets: [
      {
        label: "Available Listings",
        data: availabilityTrends.map((point) => point.availableListings),
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
      {
        label: "Unique Sellers",
        data: availabilityTrends.map((point) => point.uniqueSellers),
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
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
      <h2 className="text-xl font-semibold mb-4">Availability Trends</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  )
}
