import type { SearchableGpu } from "../hooks/useSearchData"

export interface SearchResult {
  type: "gpu" | "page"
  label: string
  description: string
  href: string
}

interface StaticPage {
  label: string
  description: string
  href: string
}

const STATIC_PAGES: StaticPage[] = [
  {
    label: "Gaming GPU Rankings",
    description: "Find the best gaming GPU for your money",
    href: "/gpu/ranking/gaming/3dmark-wildlife-extreme-fps-3840x2160",
  },
  {
    label: "AI GPU Rankings",
    description: "Compare AI and machine learning GPU performance",
    href: "/gpu/ranking/ai/fp32-flops",
  },
  {
    label: "Gaming GPU Prices",
    description: "Compare gaming GPU prices across retailers",
    href: "/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160",
  },
  {
    label: "AI GPU Prices",
    description: "Compare AI GPU prices across retailers",
    href: "/gpu/price-compare/ai/fp16-flops",
  },
  {
    label: "Compare GPUs",
    description: "Side-by-side GPU comparison tool",
    href: "/gpu/compare",
  },
  {
    label: "Learn About GPUs",
    description: "GPU specifications, benchmarks, and buying guides",
    href: "/gpu/learn",
  },
]

const MAX_GPU_RESULTS = 8
const MAX_PAGE_RESULTS = 4

export function search(query: string, gpus: SearchableGpu[]): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return allGpusByReleaseDate(gpus)

  const gpuResults = searchGpus(q, gpus)
  const pageResults = searchPages(q)
  return [...gpuResults, ...pageResults]
}

function allGpusByReleaseDate(gpus: SearchableGpu[]): SearchResult[] {
  return [...gpus]
    .sort((a, b) => {
      const da = a.releaseDate ?? ""
      const db = b.releaseDate ?? ""
      return db.localeCompare(da)
    })
    .map((gpu) => ({
      type: "gpu",
      label: gpu.label,
      description: formatGpuDescription(gpu),
      href: `/gpu/learn/card/${gpu.name}`,
    }))
}

function searchGpus(q: string, gpus: SearchableGpu[]): SearchResult[] {
  type Scored = { gpu: SearchableGpu; score: number }
  const matches: Scored[] = []

  for (const gpu of gpus) {
    const label = gpu.label.toLowerCase()
    const series = (gpu.series ?? "").toLowerCase()
    const category = (gpu.category ?? "").toLowerCase()

    if (label.startsWith(q)) {
      matches.push({ gpu, score: 0 })
    } else if (label.includes(q)) {
      matches.push({ gpu, score: 1 })
    } else if (series.includes(q) || category.includes(q)) {
      matches.push({ gpu, score: 2 })
    }
  }

  matches.sort((a, b) => a.score - b.score)

  return matches.slice(0, MAX_GPU_RESULTS).map(({ gpu }) => ({
    type: "gpu",
    label: gpu.label,
    description: formatGpuDescription(gpu),
    href: `/gpu/learn/card/${gpu.name}`,
  }))
}

function searchPages(q: string): SearchResult[] {
  const matches: { page: StaticPage; score: number }[] = []

  for (const page of STATIC_PAGES) {
    const label = page.label.toLowerCase()
    const desc = page.description.toLowerCase()

    if (label.startsWith(q)) {
      matches.push({ page, score: 0 })
    } else if (label.includes(q)) {
      matches.push({ page, score: 1 })
    } else if (desc.includes(q)) {
      matches.push({ page, score: 2 })
    }
  }

  matches.sort((a, b) => a.score - b.score)

  return matches.slice(0, MAX_PAGE_RESULTS).map(({ page }) => ({
    type: "page",
    label: page.label,
    description: page.description,
    href: page.href,
  }))
}

function formatGpuDescription(gpu: SearchableGpu): string {
  const parts: string[] = [
    `${gpu.memoryCapacityGB} GB`,
    `${gpu.fp32TFLOPS} TFLOPS`,
  ]
  if (gpu.series) parts.push(gpu.series)
  return parts.join(" | ")
}
