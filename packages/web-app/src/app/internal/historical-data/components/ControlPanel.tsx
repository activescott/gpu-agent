import { GpuSelector, GpuOption } from "@/pkgs/client/components/GpuSelector"

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
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label fw-medium">GPU</label>
            <GpuSelector
              gpuOptions={gpuOptions}
              selectedGpuSlug={selectedGpu}
              placeholder="Search for a GPU..."
              onSelect={setSelectedGpu}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-medium">Months of History</label>
            <select
              value={months}
              onChange={(e) => setMonths(Number.parseInt(e.target.value, 10))}
              className="form-select"
            >
              <option value={1}>1 Month</option>
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>
          <div className="col-md-3">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn btn-primary w-100"
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Loading...
                </>
              ) : (
                "Refresh Data"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
