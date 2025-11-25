import { Gpu } from "@/pkgs/isomorphic/model"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { GpuSpecKey } from "@/pkgs/isomorphic/model/specs"
import { Prisma } from "@prisma/client"
import { getPriceStats, GpuPriceStats } from "./ListingRepository"
import { omit } from "lodash"

type PricedGpuInfo = Omit<
  Gpu,
  "summary" | "references" | "supportedHardwareOperations" | "gpuArchitecture"
>

export type PricedGpu = {
  gpu: PricedGpuInfo
  price: GpuPriceStats
}

export async function listGpus(includeTestGpus = false): Promise<Gpu[]> {
  const gpus = await prismaSingleton.gpu.findMany()
  return gpus.filter((gpu) => gpu.name !== "test-gpu" || includeTestGpus)
}

export async function getGpu(
  name: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Gpu> {
  const result = await prisma.gpu.findUnique({ where: { name } })
  if (!result) {
    throw new Error(`Gpu not found: ${name}`)
  }
  return result
}

export async function gpuSpecAsPercent(
  gpuName: string,
  spec: GpuSpecKey,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<number> {
  const sqlSpecName = Prisma.raw(`"${spec}"`)
  const sql = Prisma.sql`
  SELECT PCT FROM (
    SELECT
      name, 
      --PERCENT_RANK() OVER (ORDER BY ${sqlSpecName}) AS PCT
      CUME_DIST() OVER (ORDER BY ${sqlSpecName}) AS PCT
    FROM "gpu"
    WHERE ${sqlSpecName} IS NOT NULL
  ) AS RANKS
  WHERE "name" = ${gpuName}
  ;`

  type RowShape = { pct: number }
  const result = await prisma.$queryRaw<RowShape[]>(sql)
  if (result.length === 0) {
    return Number.NaN
  }
  const row = result[0]
  return row.pct
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
