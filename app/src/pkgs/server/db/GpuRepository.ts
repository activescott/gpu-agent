import { Gpu } from "@/pkgs/isomorphic/model"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { GpuSpecKey } from "@/pkgs/isomorphic/model/specs"
import { Prisma } from "@prisma/client"

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

/**
 * Returns a list of gpuNames whose listings were last cached longer ago than the given date.
 */
export async function getLastCachedGpusOlderThan(
  date: Date,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<string[]> {
  const result = await prisma.gpuLastCachedListings.findMany({
    where: {
      lastCachedListings: { lt: date },
    },
  })
  return result.map((row) => row.gpuName)
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
