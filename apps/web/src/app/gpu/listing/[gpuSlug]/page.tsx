import { createDiag } from "@activescott/diag"
import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import { getGpu } from "@/pkgs/server/db/GpuRepository"
import { Gpu } from "@/pkgs/isomorphic/model"
import { chain } from "irritable-iterable"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { Integer } from "type-fest"
import { listActiveListingsForGpus } from "@/pkgs/server/db/ListingRepository"

const log = createDiag("shopping-agent:gpu:buy:gpuSlug")

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
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
    title: `Best Prices for ${gpu.label}`,
    description: `Compare prices across the Internet for ${gpu.label}`,
    alternates: { canonical: `https://coinpoet.com/gpu/buy/${gpuSlug}` },
  }
}

export default async function Page(props: GpuParams) {
  const params = await props.params
  const { gpuSlug } = params
  log.info(`Fetching cached listings for gpu ${gpuSlug} ...`)
  const gpu: Gpu = await getGpu(gpuSlug)
  const allListings = await listActiveListingsForGpus([gpuSlug])
  log.info(
    `Fetching cached listings for gpu ${gpuSlug} complete. Found ${allListings.length} listings.`,
  )
  const listings = chain(allListings)
    .head(ISOMORPHIC_CONFIG.MAX_LISTINGS_PER_PAGE() as Integer<number>)
    .collect()

  return (
    <main>
      <h1>{gpu.label} Listings</h1>
      <ListingGallery
        listings={listings.map((item) => ({
          item,
          specs: gpu,
        }))}
        initialSortKey="fp32TFLOPS"
      />
    </main>
  )
}
