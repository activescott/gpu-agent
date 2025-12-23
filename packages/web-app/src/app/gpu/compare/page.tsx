import { listGpus } from "@/pkgs/server/db/GpuRepository"
import { GpuCompareLanding } from "@/pkgs/client/components/GpuCompareLanding"

export const revalidate = 3600

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Compare GPUs Side by Side | GPU Poet",
  description:
    "Compare two GPUs side-by-side. See specs, gaming benchmarks, and prices to find the best GPU for your needs.",
  alternates: {
    canonical: "https://gpupoet.com/gpu/compare",
  },
}

export default async function CompareLandingPage() {
  const allGpus = await listGpus()
  const gpuOptions = allGpus.map((g) => ({ name: g.name, label: g.label }))

  return (
    <div className="container py-4">
      <h1>Compare GPUs</h1>
      <p className="lead">
        Select two GPUs below to compare their specifications, gaming
        benchmarks, and current prices side-by-side.
      </p>

      <GpuCompareLanding gpuOptions={gpuOptions} />
    </div>
  )
}
