import { PrismaClient } from "@prisma/client"
import { ITXClientDenyList } from "@prisma/client/runtime/library"

export const prismaSingleton = new PrismaClient()

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
