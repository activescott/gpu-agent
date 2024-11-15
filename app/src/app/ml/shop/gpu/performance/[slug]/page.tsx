import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import { topNListingsByCostPerformance } from "@/pkgs/server/db/ListingRepository"
import {
  PerformanceSlug,
  listPerformanceSlugs,
  mapSlugToPageDescription,
  mapSlugToPageTitle,
  mapSlugToSpec,
} from "../slugs"
import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:shop:performance")

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

type PerformanceParams = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = listPerformanceSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: PerformanceParams) {
  const slug = params.slug as PerformanceSlug
  const gpuSpec = mapSlugToSpec(slug)
  log.debug("generateMetadata for spec", gpuSpec)

  return {
    title: mapSlugToPageTitle(slug),
    description: mapSlugToPageDescription(slug),
    alternates: {
      canonical: `https://coinpoet.com/ml/shop/gpu/performance/${slug}`,
    },
  }
}

export default async function Page({ params }: PerformanceParams) {
  const slug = params.slug as PerformanceSlug
  const spec = mapSlugToSpec(slug)
  const TOP_N = 10
  const topListings = await topNListingsByCostPerformance(spec, TOP_N)
  const mapped = topListings.map((listing) => ({
    specs: listing.gpu,
    item: listing,
  }))
  return (
    <ListingGallery listings={mapped} initialSortKey={spec} hideSort={true} />
  )
}
