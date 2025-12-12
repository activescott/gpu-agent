import { getMetricDefinitionBySlug } from "@/pkgs/server/db/GpuRepository"
import Link from "next/link"
import { notFound } from "next/navigation"

// revalidate the data at most every hour
export const revalidate = 3600

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

type BenchmarkParams = {
  params: Promise<{ benchmark: string }>
}

export async function generateMetadata(props: BenchmarkParams) {
  const params = await props.params
  const { benchmark } = params

  // Use database-driven metric definition
  const metric = await getMetricDefinitionBySlug(benchmark)

  if (!metric || metric.category !== "gaming") {
    return {
      title: "Benchmark Not Found",
      description: "The requested benchmark could not be found.",
    }
  }

  return {
    title: `${metric.name} - Gaming GPU Benchmark`,
    description: metric.description,
    alternates: {
      canonical: `https://gpupoet.com/gpu/benchmark/gaming/${benchmark}`,
    },
  }
}

export default async function Page(props: BenchmarkParams) {
  const params = await props.params
  const { benchmark } = params

  // Use database-driven metric definition
  const metric = await getMetricDefinitionBySlug(benchmark)

  if (!metric || metric.category !== "gaming") {
    notFound()
  }

  return (
    <main className="container">
      <h1>{metric.name}</h1>

      <div className="mb-4">
        <span className="badge bg-primary me-2">Gaming</span>
        <span className="badge bg-secondary">{metric.unit}</span>
      </div>

      <section className="mb-4">
        <h2>What is this benchmark?</h2>
        <p className="lead">{metric.description}</p>
      </section>

      <section className="mb-4">
        <h2>Why does this matter?</h2>
        <p>{metric.descriptionDollarsPer}</p>
      </section>

      <section className="mb-4">
        <h2>Compare GPUs by this benchmark</h2>
        <p>
          See which GPUs offer the best value for money based on {metric.name}:
        </p>
        <ul>
          <li>
            <Link href={`/gpu/ranking/gaming/${benchmark}`}>
              View GPU rankings by {metric.name}
            </Link>
          </li>
          <li>
            <Link href={`/gpu/price-compare/gaming/${benchmark}`}>
              Shop GPUs by cost per {metric.unit}
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
