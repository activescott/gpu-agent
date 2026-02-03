import { useEffect, useState } from "react"

export interface SearchableGpu {
  name: string
  label: string
  series: string | null
  category: string | null
  memoryCapacityGB: number
  fp32TFLOPS: number
  releaseDate: string | null
}

let cached: SearchableGpu[] | null = null

export function useSearchData(): { data: SearchableGpu[]; loading: boolean } {
  const [data, setData] = useState<SearchableGpu[]>(cached ?? [])
  const [loading, setLoading] = useState(cached === null)

  useEffect(() => {
    if (cached) return
    let cancelled = false
    fetch("/api/search-data")
      .then((res) => res.json())
      .then((json: SearchableGpu[]) => {
        if (cancelled) return
        cached = json
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading }
}
