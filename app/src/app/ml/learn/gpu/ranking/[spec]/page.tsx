import { GpuSpecsDescription } from "@/pkgs/isomorphic/model/specs"
import {
  GpuSpecSlug,
  gpuRankingCanonicalPath,
  gpuRankingDescription,
  gpuRankingTitle,
  listGpuRankingSlugs,
  mapSlugToSpec,
} from "../slugs"
import { listGpus } from "@/pkgs/server/db/GpuRepository"
import { getPriceStats } from "@/pkgs/server/db/ListingRepository"
import { GpuSpecsTable, PricedGpu } from "./GpuSpecsTable"
import Link from "next/link"

// revalidate the data at most every hour: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 3600

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
  return {
    title: gpuRankingTitle(params.spec as GpuSpecSlug),
    description: gpuRankingDescription(params.spec as GpuSpecSlug),
    alternates: {
      canonical: `https://coinpoet.com/${gpuRankingCanonicalPath(
        params.spec as GpuSpecSlug,
      )}`,
    },
  }
}

export default async function Page({ params }: GpuSpecSlugParams) {
  const primarySpec = mapSlugToSpec(params.spec as GpuSpecSlug)
  const desc = GpuSpecsDescription[primarySpec]

  const gpus = await listGpus()
  // for each GPU, get the average price

  const unsortedPricedGpus = await Promise.all(
    gpus.map(async (gpu) => {
      const stats = await getPriceStats(gpu.name)
      return {
        gpu,
        price: stats,
      } as PricedGpu
    }),
  )

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
