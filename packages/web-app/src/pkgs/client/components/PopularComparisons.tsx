import Link from "next/link"
import type { JSX } from "react"

interface Comparison {
  gpu1Label: string
  gpu2Label: string
  url: string
}

const POPULAR_COMPARISONS: Comparison[] = [
  {
    gpu1Label: "RX 9070 XT",
    gpu2Label: "RTX 4070 Ti Super",
    url: "/gpu/compare/amd-radeon-rx-9070-xt/vs/nvidia-geforce-rtx-4070-ti-super",
  },
  {
    gpu1Label: "RTX 4090",
    gpu2Label: "RTX 5090",
    url: "/gpu/compare/nvidia-geforce-rtx-5090/vs/nvidia-geforce-rtx-4090",
  },
  {
    gpu1Label: "RTX 4070 Super",
    gpu2Label: "RTX 4070 Ti Super",
    url: "/gpu/compare/nvidia-geforce-rtx-4070-super/vs/nvidia-geforce-rtx-4070-ti-super",
  },
  {
    gpu1Label: "RTX 4060",
    gpu2Label: "RTX 3060 Ti",
    url: "/gpu/compare/nvidia-geforce-rtx-3060-ti/vs/nvidia-geforce-rtx-4060",
  },
]

interface PopularComparisonsProps {
  /** Optional title override. Default: "Popular GPU Comparisons" */
  title?: string
  /** Whether to show as a compact inline list. Default: false (grid layout) */
  compact?: boolean
}

/**
 * Displays a list of popular GPU comparisons with links.
 * Can be used on the homepage, learn page, or compare landing page.
 */
export function PopularComparisons({
  title = "Popular GPU Comparisons",
  compact = false,
}: PopularComparisonsProps): JSX.Element {
  if (compact) {
    return (
      <div>
        <h3 className="h6 mb-2">{title}</h3>
        <div className="d-flex flex-wrap gap-2">
          {POPULAR_COMPARISONS.map((comparison) => (
            <Link
              key={comparison.url}
              href={comparison.url}
              className="btn btn-sm btn-outline-secondary"
            >
              {comparison.gpu1Label} vs {comparison.gpu2Label}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="h5 mb-3">{title}</h3>
      <div className="row g-3">
        {POPULAR_COMPARISONS.map((comparison) => (
          <div key={comparison.url} className="col-md-6 col-lg-3">
            <Link
              href={comparison.url}
              className="card text-decoration-none h-100"
            >
              <div className="card-body text-center">
                <span className="text-primary">{comparison.gpu1Label}</span>
                <span className="mx-2 text-muted">vs</span>
                <span className="text-primary">{comparison.gpu2Label}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
