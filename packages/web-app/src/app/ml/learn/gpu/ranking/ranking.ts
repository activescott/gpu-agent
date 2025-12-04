import { Gpu } from "@/pkgs/isomorphic/model"
import { listGpus } from "@/pkgs/server/db/GpuRepository"
import {
  getPriceStats,
  GpuPriceStats,
} from "@/pkgs/server/db/ListingRepository"
import { omit } from "lodash"

type PricedGpuInfo = Omit<
  Gpu,
  "summary" | "references" | "supportedHardwareOperations" | "gpuArchitecture"
>

export type PricedGpu = {
  gpu: PricedGpuInfo
  price: GpuPriceStats
}

export async function calculateGpuPriceStats(): Promise<PricedGpu[]> {
  const gpus = await listGpus()

  const MIN_GPU_MEM_FOR_ML_GB = 10
  const unsortedPricedGpus = await Promise.all(
    gpus
      // Lets filter out the 8GB 580X and similarly low memory GPUs.
      .filter((gpu) => gpu.memoryCapacityGB >= MIN_GPU_MEM_FOR_ML_GB)
      .map(async (gpu) => {
        const stats = await getPriceStats(gpu.name)
        /*
        NOTE: React/Next.js server components dump all the props into the client-delivered JS making the page huge: https://github.com/vercel/next.js/discussions/42170
        Lighthouse complained about the JS size and this removed about ~16KB of JS from the page.
        */
        const gpuMinimal = omit(gpu, [
          "summary",
          "references",
          "supportedHardwareOperations",
          "gpuArchitecture",
        ])
        return {
          gpu: gpuMinimal,
          price: stats,
        } as PricedGpu
      }),
  )
  return unsortedPricedGpus
}
