import { Gpu } from "@/pkgs/isomorphic/model"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"

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

export async function updateGpuLastCachedListings(
  name: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<void> {
  await prisma.gpu.update({
    where: { name },
    data: {
      lastCachedListings: new Date(),
    },
  })
}
