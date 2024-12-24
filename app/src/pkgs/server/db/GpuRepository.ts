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
