import { GpuMetricsDescription } from "@/pkgs/isomorphic/model"
import {
  mapSlugToMetric,
  listBenchmarkSlugs,
  type RankingSlug,
} from "@/app/gpu/ranking/slugs"
import Link from "next/link"
import { notFound } from "next/navigation"

// revalidate the data at most every hour
export const revalidate = 3600

type BenchmarkParams = {
  params: Promise<{ benchmark: string }>
}

export async function generateStaticParams() {
  // Use the deterministic slug mapping from slugs.ts
  return listBenchmarkSlugs().map((slug) => ({
    benchmark: slug,
  }))
}

export async function generateMetadata(props: BenchmarkParams) {
  const params = await props.params
  const { benchmark } = params

  // Use deterministic slug-to-metric mapping
  const benchmarkKey = mapSlugToMetric(benchmark as RankingSlug, "gaming")
  const desc = GpuMetricsDescription[benchmarkKey]

  if (!desc) {
    return {
      title: "Benchmark Not Found",
      description: "The requested benchmark could not be found.",
    }
  }

  return {
    title: `${desc.label} - Gaming GPU Benchmark`,
    description: desc.description,
    alternates: {
      canonical: `https://coinpoet.com/gpu/benchmark/gaming/${benchmark}`,
    },
  }
}

export default async function Page(props: BenchmarkParams) {
  const params = await props.params
  const { benchmark } = params

  // Use deterministic slug-to-metric mapping
  const benchmarkKey = mapSlugToMetric(benchmark as RankingSlug, "gaming")
  const desc = GpuMetricsDescription[benchmarkKey]

  if (!desc || desc.category !== "gaming") {
    notFound()
  }

  return (
    <main className="container">
      <h1>{desc.label}</h1>

      <div className="mb-4">
        <span className="badge bg-primary me-2">Gaming</span>
        <span className="badge bg-secondary">{desc.unit}</span>
      </div>

      <section className="mb-4">
        <h2>What is this benchmark?</h2>
        <p className="lead">{desc.description}</p>
      </section>

      <section className="mb-4">
        <h2>Why does this matter?</h2>
        <p>{desc.descriptionDollarsPer}</p>
      </section>

      <section className="mb-4">
        <h2>Compare GPUs by this benchmark</h2>
        <p>
          See which GPUs offer the best value for money based on {desc.label}:
        </p>
        <ul>
          <li>
            <Link href={`/gpu/ranking/gaming/${benchmark}`}>
              View GPU rankings by {desc.label}
            </Link>
          </li>
          <li>
            <Link href={`/gpu/price-compare/gaming/cost-per-${benchmark}`}>
              Shop GPUs by cost per {desc.unit}
            </Link>
          </li>
        </ul>
      </section>

      <section className="mb-4">
        <h2>About the data</h2>
        <p>
          Benchmark data is sourced from{" "}
          <a
            href="https://openbenchmarking.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenBenchmarking.org
          </a>
          , an open-source benchmark database that aggregates real-world
          performance data from hardware enthusiasts around the world.
        </p>
      </section>
    </main>
  )
}
