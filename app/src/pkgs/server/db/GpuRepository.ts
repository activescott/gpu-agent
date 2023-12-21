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
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<void> {
  await prisma.gpuLastCachedListings.upsert({
    create: {
      gpuName,
      lastCachedListings: new Date(),
    },
    update: {
      lastCachedListings: new Date(),
    },
    where: {
      gpuName,
    },
  })
}

export async function getGpuLastCachedListings(
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Date | null> {
  const result = await prisma.gpuLastCachedListings.findUnique({
    where: { gpuName },
  })
  if (result) {
    return result.lastCachedListings
  }
  return null
}
