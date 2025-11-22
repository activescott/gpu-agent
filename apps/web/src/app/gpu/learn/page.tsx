import { Metadata } from "next"
import { Feature } from "@/pkgs/client/components/Feature"
import Link from "next/link"
import { listGpus } from "@/pkgs/server/db/GpuRepository"

export const metadata: Metadata = {
  title: "Learn About GPUs for AI and Gaming",
  description:
    "Comprehensive guides and resources for choosing the right GPU for machine learning, AI workloads, and gaming performance.",
  alternates: { canonical: "https://coinpoet.com/gpu/learn" },
}

export default async function Page() {
  const allGpus = await listGpus()

  // Group GPUs by series
  const gpusBySeries = allGpus.reduce(
    (acc, gpu) => {
      const series = gpu.series ?? "Other"
      if (!acc[series]) {
        acc[series] = []
      }
      acc[series].push(gpu)
      return acc
    },
    {} as Record<string, typeof allGpus>,
  )

  // Sort series names and GPUs within each series
  const sortedSeries = Object.keys(gpusBySeries).sort()

  return (
    <div>
      <h1>{metadata.title as string}</h1>
      <p>
        Explore our comprehensive guides and resources for understanding GPUs
        across different use cases.
      </p>
      <div className="row g-4 py-4 row-cols-1 row-cols-lg-2">
        <Feature title="AI & Machine Learning" icon="robot">
          <p>
            Learn about GPUs for machine learning, deep learning, and AI
            workloads.
          </p>
          <ul>
            <li>
              <Link href="/gpu/learn/ai">AI GPU Guides & Resources</Link>
            </li>
            <li>
              <Link href="/gpu/ranking/ai/fp32-flops">
                AI GPU Rankings by Cost-Performance
              </Link>
            </li>
            <li>
              <Link href="/gpu/buy/ai/cost-per-fp32-flops">
                Shop GPUs by AI Performance
              </Link>
            </li>
          </ul>
        </Feature>

        <Feature title="Gaming Performance" icon="joystick">
          <p>
            Understand GPU gaming benchmarks and cost-performance for popular
            games.
          </p>
          <ul>
            <li>
              <Link href="/gpu/benchmark/gaming/counter-strike-2-fps-3840x2160">
                Counter-Strike 2 Benchmarks
              </Link>
            </li>
            <li>
              <Link href="/gpu/benchmark/gaming/3dmark-wildlife-extreme-fps">
                3DMark Wild Life Extreme Benchmarks
              </Link>
            </li>
            <li>
              <Link href="/gpu/ranking/gaming/counter-strike-2-fps-3840x2160">
                Gaming GPU Rankings
              </Link>
            </li>
            <li>
              <Link href="/gpu/buy/gaming/cost-per-counter-strike-2-fps-3840x2160">
                Shop GPUs by Gaming Performance
              </Link>
            </li>
          </ul>
        </Feature>

        <Feature title="GPU Specifications" icon="motherboard">
          <p>
            Detailed specifications and performance data for individual GPUs.
          </p>
          {sortedSeries.map((series) => (
            <div key={series} className="mb-4">
              <h4 className="fs-5 text-secondary mb-2">{series}</h4>
              <ul className="list-unstyled">
                {gpusBySeries[series]
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((gpu) => (
                    <li key={gpu.name} className="d-inline-block me-2 mb-2">
                      <Link
                        href={`/gpu/learn/card/${gpu.name}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        {gpu.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </Feature>
      </div>
    </div>
  )
}
