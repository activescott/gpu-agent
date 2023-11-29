import { PrismaClient } from "@prisma/client"
import { Gpu } from "@/pkgs/isomorphic/model"

export async function listGpus(prisma = new PrismaClient()): Promise<Gpu[]> {
  return prisma.gpu.findMany()
}

export async function getGpu(
  name: string,
  prisma = new PrismaClient(),
): Promise<Gpu> {
  const result = await prisma.gpu.findUnique({ where: { name } })
  if (!result) {
    throw new Error(`Gpu not found: ${name}`)
  }
  return result
}
