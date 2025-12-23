"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GpuSelector, GpuOption } from "./GpuSelector"
import { PopularComparisons } from "./PopularComparisons"

import type { JSX } from "react"

interface GpuCompareLandingProps {
  gpuOptions: GpuOption[]
}

/**
 * Landing page component for GPU comparison.
 * Allows users to select two GPUs and redirects to the comparison page.
 */
export function GpuCompareLanding({
  gpuOptions,
}: GpuCompareLandingProps): JSX.Element {
  const router = useRouter()
  const [gpu1Slug, setGpu1Slug] = useState<string | undefined>()
  const [gpu2Slug, setGpu2Slug] = useState<string | undefined>()

  const handleCompare = () => {
    if (gpu1Slug && gpu2Slug) {
      const [first, second] = [gpu1Slug, gpu2Slug].sort()
      router.push(`/gpu/compare/${first}/vs/${second}`)
    }
  }

  const canCompare = gpu1Slug && gpu2Slug && gpu1Slug !== gpu2Slug

  return (
    <div className="row g-4">
      <div className="col-md-5">
        <div className="card h-100">
          <div className="card-header bg-primary text-white">
            <h2 className="h5 mb-0">First GPU</h2>
          </div>
          <div className="card-body">
            <GpuSelector
              gpuOptions={gpuOptions}
              selectedGpuSlug={gpu1Slug}
              otherSelectedSlug={gpu2Slug}
              placeholder="Search for first GPU..."
              onSelect={setGpu1Slug}
            />
            {gpu1Slug && (
              <p className="mt-2 mb-0 text-success">
                Selected: {gpuOptions.find((g) => g.name === gpu1Slug)?.label}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="col-md-2 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <span className="display-4 text-muted">vs</span>
        </div>
      </div>

      <div className="col-md-5">
        <div className="card h-100">
          <div className="card-header bg-secondary text-white">
            <h2 className="h5 mb-0">Second GPU</h2>
          </div>
          <div className="card-body">
            <GpuSelector
              gpuOptions={gpuOptions}
              selectedGpuSlug={gpu2Slug}
              otherSelectedSlug={gpu1Slug}
              placeholder="Search for second GPU..."
              onSelect={setGpu2Slug}
            />
            {gpu2Slug && (
              <p className="mt-2 mb-0 text-success">
                Selected: {gpuOptions.find((g) => g.name === gpu2Slug)?.label}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="col-12 text-center mt-4">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleCompare}
          disabled={!canCompare}
        >
          Compare GPUs
        </button>
        {gpu1Slug && gpu2Slug && gpu1Slug === gpu2Slug && (
          <p className="text-danger mt-2">
            Please select two different GPUs to compare.
          </p>
        )}
      </div>

      {/* Popular Comparisons */}
      <div className="col-12 mt-5">
        <PopularComparisons />
      </div>
    </div>
  )
}
