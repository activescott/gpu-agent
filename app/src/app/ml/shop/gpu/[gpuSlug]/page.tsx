import { createDiag } from "@activescott/diag"
import { fetchListingsForGpuWithCache } from "@/pkgs/server/listings"
import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import { getGpu, listGpus } from "@/pkgs/server/db/GpuRepository"
import { Gpu } from "@/pkgs/isomorphic/model"
import { chain } from "irritable-iterable"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { Integer } from "type-fest"

const log = createDiag("shopping-agent:shop:gpuSlug")

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

export async function generateStaticParams() {
  const gpuList = await listGpus()
  return gpuList.map((post) => ({
    slug: post.name,
  }))
}

type GpuParams = {
  params: { gpuSlug: string }
}

export async function generateMetadata({ params }: GpuParams) {
  const { gpuSlug } = params
  log.debug("generateStaticMetadata for gpu ", gpuSlug)
  const gpu = await getGpu(gpuSlug)
  return {
    title: `Best Prices for ${gpu.label}`,
    description: `Compare prices across the Internet for ${gpu.label}`,
    alternates: { canonical: `https://coinpoet.com/ml/shop/gpu/${gpuSlug}` },
  }
}

export default async function Page({ params }: GpuParams) {
  const { gpuSlug } = params
  const gpu: Gpu = await getGpu(gpuSlug)
  const allListings = await fetchListingsForGpuWithCache(gpu.name)
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
