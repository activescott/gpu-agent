import { GpuSpecsDescription } from "@/pkgs/isomorphic/model/specs"
import {
  GpuSpecSlug,
  gpuRankingCanonicalPath,
  gpuRankingDescription,
  gpuRankingTitle,
  listGpuRankingSlugs,
  mapSlugToSpec,
} from "../slugs"
import { GpuSpecsTable } from "./GpuSpecsTable"
import Link from "next/link"
import { calculateGpuPriceStats } from "../ranking"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

// Force dynamic rendering to avoid build-time dependency on NEXT_PUBLIC_DOMAIN environment variable
// This page generates canonical URLs in metadata, but we don't want to bake the domain into the Docker image
export const dynamic = "force-dynamic"

type GpuSpecSlugParams = {
  params: { spec: string }
}

export async function generateStaticParams() {
  const slugs = listGpuRankingSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: GpuSpecSlugParams) {
  const domain_url = `https://${ISOMORPHIC_CONFIG.NEXT_PUBLIC_DOMAIN()}`
  return {
    title: gpuRankingTitle(params.spec as GpuSpecSlug),
    description: gpuRankingDescription(params.spec as GpuSpecSlug),
    alternates: {
      canonical: `${domain_url}${gpuRankingCanonicalPath(
        params.spec as GpuSpecSlug,
      )}`,
    },
  }
}

export default async function Page({ params }: GpuSpecSlugParams) {
  const primarySpec = mapSlugToSpec(params.spec as GpuSpecSlug)
  const desc = GpuSpecsDescription[primarySpec]

  const unsortedPricedGpus = await calculateGpuPriceStats()

  return (
    <>
      <h1>GPUs Ranked by Cost per {desc.label}</h1>
      <p>
        Something missing? <Link href="/contact">Let us know</Link> and
        we&apos;ll add it if we can.
      </p>
      <GpuSpecsTable
        primarySpecInitial={primarySpec}
        gpusInitial={unsortedPricedGpus}
      />
    </>
  )
}
