import { createDiag } from "@activescott/diag"
import { Suspense, type JSX } from "react"
import { ShopListingsWithFilters } from "./ShopListingsWithFilters"
import { getGpu } from "@/pkgs/server/db/GpuRepository"
import { Gpu, GpuMetricKey, GpuMetricKeys } from "@/pkgs/isomorphic/model"
import { chain } from "irritable-iterable"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { Integer } from "type-fest"
import { listActiveListingsForGpus } from "@/pkgs/server/db/ListingRepository"
import Link from "next/link"

const log = createDiag("shopping-agent:gpu:shop:gpuSlug")

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

type GpuParams = {
  params: Promise<{ gpuSlug: string }>
  searchParams: Promise<{ sortBy?: string }>
}

export async function generateMetadata(props: GpuParams) {
  const params = await props.params
  const { gpuSlug } = params
  log.debug("generateStaticMetadata for gpu ", gpuSlug)
  const gpu = await getGpu(gpuSlug)
  return {
    title: `Best Prices for ${gpu.label}`,
    description: `Compare prices across the Internet for ${gpu.label}`,
    alternates: { canonical: `https://gpupoet.com/gpu/shop/${gpuSlug}` },
  }
}

function isValidMetricKey(key: string): key is GpuMetricKey {
  return GpuMetricKeys.includes(key as GpuMetricKey)
}

export default async function Page(props: GpuParams) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { gpuSlug } = params
  const { sortBy } = searchParams
  log.info(`Fetching cached listings for gpu ${gpuSlug} ...`)
  const gpu: Gpu = await getGpu(gpuSlug)
  const allListings = await listActiveListingsForGpus([gpuSlug])
  log.info(
    `Fetching cached listings for gpu ${gpuSlug} complete. Found ${allListings.length} listings.`,
  )
  const listings = chain(allListings)
    .head(ISOMORPHIC_CONFIG.MAX_LISTINGS_PER_PAGE() as Integer<number>)
    .collect()

  // Use sortBy query parameter if valid, otherwise default to fp32TFLOPS
  const initialSortKey: GpuMetricKey =
    sortBy && isValidMetricKey(sortBy) ? sortBy : "fp32TFLOPS"

  return (
    <main>
      <h1>{gpu.label} Listings</h1>
      <p className="lead mb-4">
        Below are active listings for the {gpu.label} GPU. These listings are
        available and in-stock and you can buy them now. To learn more about the{" "}
        {gpu.label} GPU visit the{" "}
        <Link href={`/gpu/learn/card/${gpu.name}`}>
          {gpu.label} specifications page
        </Link>
        .
      </p>
      <Suspense fallback={<ListingsFallback />}>
        <ShopListingsWithFilters
          listings={listings.map((item) => ({
            item,
            specs: gpu,
          }))}
          initialSortKey={initialSortKey}
        />
      </Suspense>
    </main>
  )
}

function ListingsFallback(): JSX.Element {
  return (
    <div className="d-flex justify-content-center py-4">
      <div className="spinner-border text-secondary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  )
}
