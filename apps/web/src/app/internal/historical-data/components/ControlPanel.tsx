interface GpuOption {
  name: string
  label: string
}

interface ControlPanelProps {
  selectedGpu: string
  setSelectedGpu: (gpu: string) => void
  months: number
  setMonths: (months: number) => void
  loading: boolean
  onRefresh: () => void
  gpuOptions: GpuOption[]
}

export default function ControlPanel({
  selectedGpu,
  setSelectedGpu,
  months,
  setMonths,
  loading,
  onRefresh,
  gpuOptions,
}: ControlPanelProps) {
  return (
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
            {gpuOptions.map((gpu) => (
              <option key={gpu.name} value={gpu.name}>
                {gpu.label}
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
            onClick={onRefresh}
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </div>
      </div>
    </div>
  )
}
