import { PrismaClient } from "@prisma/client"
import { ITXClientDenyList } from "@prisma/client/runtime/library"

export const prismaSingleton = new PrismaClient()

export type PrismaClientWithinTransaction = Omit<
  PrismaClient,
  ITXClientDenyList
>

export async function withTransaction(
  fn: (prisma: PrismaClientWithinTransaction) => Promise<void>,
  options: Parameters<typeof prismaSingleton.$transaction>[1] = {},
): Promise<void> {
  await prismaSingleton.$transaction(fn, options)
}
