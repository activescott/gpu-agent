import { GpuInfo } from "@/pkgs/client/components/GpuInfo"
import { getGpu as getGpuWithoutCache } from "@/pkgs/server/db/GpuRepository"
import { memoize } from "lodash"

const gpuName = "nvidia-rtx-a5000"

const getGpu = memoize(getGpuWithoutCache)

export async function generateMetadata() {
  const gpu = await getGpu(gpuName)
  return {
    title: `Price Compare ${gpu.label}`,
    description: `Compare prices for ${gpu.label}`,
    alternates: { canonical: `https://coinpoet.com/ml/shop/gpu/${gpuName}` },
  }
}

export default async function Page() {
  const gpu = await getGpu(gpuName)

  return <GpuInfo gpu={gpu} />
}
