import { GpuInfo } from "@/pkgs/client/components/GpuInfo"
import {
  getGpu as getGpuWithoutCache,
  listGpus,
} from "@/pkgs/server/db/GpuRepository"
import { createDiag } from "@activescott/diag"
import { memoize } from "lodash"

const log = createDiag("shopping-agent:learn:gpuSlug")

const getGpu = memoize(getGpuWithoutCache)

// revalidate the data at most every hour:
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
    title: `${gpu.label} GPU Performance Specifications`,
    description: `Learn about the ${gpu.label} Machine Learning GPU.`,
    alternates: { canonical: `https://coinpoet.com/ml/learn/gpu/${gpuSlug}` },
  }
}

export default async function Page({ params }: GpuParams) {
  const { gpuSlug } = params
  const gpu = await getGpu(gpuSlug)
  return <GpuInfo gpu={gpu} />
}