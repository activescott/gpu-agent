import { GpuInfo, BenchmarkPercentile } from "@/pkgs/client/components/GpuInfo"
import { GpuSpecKey, GpuSpecKeys } from "@/pkgs/isomorphic/model/specs"
import { Gpu } from "@/pkgs/isomorphic/model"
import {
  getGpu as getGpuWithoutCache,
  gpuSpecAsPercent,
  getAllMetricDefinitions,
  calculateAllGpuPercentilesForMetric,
  getMetricValuesBySlug,
} from "@/pkgs/server/db/GpuRepository"
import { getPriceStats } from "@/pkgs/server/db/ListingRepository"
import { createDiag } from "@activescott/diag"
import { memoize } from "lodash"

const log = createDiag("shopping-agent:learn:gpuSlug")

const getGpu = memoize(getGpuWithoutCache)

/**
 * Extracts the brand name from the GPU label (e.g., "NVIDIA RTX 4090" -> "NVIDIA")
 */
function extractBrandName(label: string): string {
  const brand = label.split(" ")[0]
  // Handle common brand name normalizations
  if (brand.toUpperCase() === "AMD") return "AMD"
  if (brand.toUpperCase() === "NVIDIA") return "NVIDIA"
  if (brand.toUpperCase() === "INTEL") return "Intel"
  return brand
}

/**
 * Formats manufacturer identifier type to human-readable label for JSON-LD.
 */
function formatIdentifierTypeForSchema(type: string): string {
  const labels: Record<string, string> = {
    nvpn: "NVIDIA Part Number",
    board_id: "Board ID",
    product_sku: "Product SKU",
    opn: "AMD Ordering Part Number",
    model_number: "Model Number",
    mm_number: "Material Master Number",
    spec_code: "Spec Code",
    product_code: "Product Code",
  }
  return labels[type.toLowerCase()] || type.replaceAll("_", " ")
}

/**
 * Builds JSON-LD structured data for the GPU product page.
 * Uses Schema.org Product schema to help search engines understand the page content.
 */
function buildStructuredData(gpu: Gpu): object {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${gpu.label} ${gpu.memoryCapacityGB}GB`,
    description: gpu.summary,
    brand: {
      "@type": "Brand",
      name: extractBrandName(gpu.label),
    },
    category: "Graphics Card",
  }

  // Add manufacturer identifiers as SKU, MPN, and additionalProperty
  if (gpu.manufacturerIdentifiers && gpu.manufacturerIdentifiers.length > 0) {
    const firstId = gpu.manufacturerIdentifiers[0]
    structuredData.sku = firstId.value
    structuredData.mpn = firstId.value

    structuredData.additionalProperty = gpu.manufacturerIdentifiers.map(
      (id) => ({
        "@type": "PropertyValue",
        name: formatIdentifierTypeForSchema(id.type),
        value: id.value,
      }),
    )
  }

  // Add third-party products as related products
  if (gpu.thirdPartyProducts && gpu.thirdPartyProducts.length > 0) {
    structuredData.isRelatedTo = gpu.thirdPartyProducts.map((product) => ({
      "@type": "Product",
      name: product.productName,
      sku: product.identifier,
      manufacturer: {
        "@type": "Organization",
        name: product.company,
      },
    }))
  }

  return structuredData
}

// revalidate the data at most every hour:
export const revalidate = 3600

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

type GpuParams = {
  params: Promise<{ gpuSlug: string }>
}

export async function generateMetadata(props: GpuParams) {
  const params = await props.params
  const { gpuSlug } = params
  log.debug("generateStaticMetadata for gpu ", gpuSlug)
  const gpu = await getGpu(gpuSlug)
  return {
    title: `${gpu.label} ${gpu.memoryCapacityGB}GB Specifications for AI Enthusiasts`,
    description: `Learn about the ${gpu.label} Machine Learning GPU.`,
    alternates: { canonical: `https://gpupoet.com/gpu/learn/card/${gpuSlug}` },
  }
}

export default async function Page(props: GpuParams) {
  const params = await props.params
  const { gpuSlug } = params
  const gpu = await getGpu(gpuSlug)
  const mapPercentages = new Map<GpuSpecKey, number>()

  for (const key of GpuSpecKeys) {
    mapPercentages.set(key, await gpuSpecAsPercent(gpu.name, key))
  }
  const gpuSpecPercentages = Object.fromEntries(mapPercentages) as Record<
    GpuSpecKey,
    number
  >

  // Fetch gaming benchmark data
  const allMetrics = await getAllMetricDefinitions()
  const gamingMetrics = allMetrics.filter((m) => m.category === "gaming")

  const benchmarkData: BenchmarkPercentile[] = await Promise.all(
    gamingMetrics.map(async (metric) => {
      const [percentileMap, valueMap] = await Promise.all([
        calculateAllGpuPercentilesForMetric(metric.slug),
        getMetricValuesBySlug(metric.slug),
      ])
      return {
        slug: metric.slug,
        name: metric.name,
        unit: metric.unitShortest,
        value: valueMap.get(gpu.name),
        percentile: percentileMap.get(gpu.name),
      }
    }),
  )

  // Filter to only benchmarks that have data for this GPU
  const gpuBenchmarkPercentiles = benchmarkData.filter(
    (b) => b.value !== undefined && b.percentile !== undefined,
  )

  const listings = await getPriceStats(gpu.name)
  const structuredData = buildStructuredData(gpu)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GpuInfo
        gpu={gpu}
        minimumPrice={listings.minPrice}
        activeListingCount={listings.activeListingCount}
        gpuSpecPercentages={gpuSpecPercentages}
        gpuBenchmarkPercentiles={gpuBenchmarkPercentiles}
      />
    </>
  )
}
