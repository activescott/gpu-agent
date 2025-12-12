import { PrismaClient } from "@prisma/client"
import { ITXClientDenyList } from "@prisma/client/runtime/library"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prismaSingleton =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaSingleton
}

export type PrismaClientWithinTransaction = Omit<
  PrismaClient,
  ITXClientDenyList
>

export async function withTransaction<TReturn>(
  fn: (prisma: PrismaClientWithinTransaction) => Promise<TReturn>,
  options: Parameters<typeof prismaSingleton.$transaction>[1] = {},
): Promise<TReturn> {
  return await prismaSingleton.$transaction<TReturn>(fn, options)
}
