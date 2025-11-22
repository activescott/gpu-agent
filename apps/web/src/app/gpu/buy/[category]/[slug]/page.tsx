import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import { MetricSelector } from "@/pkgs/client/components/MetricSelector"
import { topNListingsByCostPerformance } from "@/pkgs/server/db/ListingRepository"
import {
  BuySlug,
  mapSlugToPageDescription,
  mapSlugToPageTitle,
  mapSlugToMetric,
  canonicalPathForSlug,
} from "../../slugs"
import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:gpu:buy:category:slug")

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

type CostPerMetricParams = {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata(props: CostPerMetricParams) {
  const params = await props.params
  const { category, slug } = params
  const categoryTyped = category as "ai" | "gaming"
  const slugTyped = slug as BuySlug

  log.debug("generateMetadata for category", category, "slug", slug)

  return {
    title: mapSlugToPageTitle(slugTyped, categoryTyped),
    description: mapSlugToPageDescription(slugTyped, categoryTyped),
    alternates: {
      canonical: `https://coinpoet.com${canonicalPathForSlug(slugTyped, categoryTyped)}`,
    },
  }
}

export default async function Page(props: CostPerMetricParams) {
  const params = await props.params
  const { category, slug } = params
  const categoryTyped = category as "ai" | "gaming"
  const slugTyped = slug as BuySlug
  const metric = mapSlugToMetric(slugTyped, categoryTyped)

  const TOP_N = 100
  const topListings = await topNListingsByCostPerformance(metric, TOP_N)
  const mapped = topListings.map((listing) => ({
    specs: listing.gpu,
    item: listing,
  }))

  return (
    <>
      <MetricSelector currentMetric={metric} />
      <ListingGallery
        listings={mapped}
        initialSortKey={metric}
        hideSort={true}
      />
    </>
  )
}
