import { createLogger } from "@/lib/logger"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

const log = createLogger("isomorphic:retry")

const TRANSACTION_DEADLOCK_OR_WRITE_CONFLICT = "P2034"
const MAX_TRANSACTION_RETRIES = 3

/**
 * Retry predicate for Prisma transactions that handles deadlock/write conflict errors.
 * Use with withRetry() when running Prisma transactions.
 */
export function shouldRetryPrismaTransaction(
  error: unknown,
  retryCount: number,
): boolean {
  const prismaError =
    error instanceof PrismaClientKnownRequestError
      ? (error as PrismaClientKnownRequestError)
      : null

  const errorMessage = error instanceof Error ? error.message : String(error)
  log.warn(
    { prismaErrorCode: prismaError?.code, retryCount, err: error },
    `transaction failed, checking if retryable: code=${prismaError?.code ?? "unknown"} message=${errorMessage}`,
  )

  // https://www.prisma.io/docs/orm/reference/error-reference#error-codes
  if (
    retryCount < MAX_TRANSACTION_RETRIES &&
    prismaError?.code === TRANSACTION_DEADLOCK_OR_WRITE_CONFLICT
  ) {
    return true
  }

  log.error(
    { err: error, retryCount },
    `transaction failed permanently: code=${prismaError?.code ?? "unknown"} message=${errorMessage}`,
  )
  return false
}

export async function withRetry<T>(
  retryable: () => Promise<T>,
  shouldRetry: (err: unknown, retryCount: number) => boolean,
): Promise<T> {
  for (let retryCount = 0; ; retryCount++) {
    if (retryCount > 1) {
      log.warn({ retryCount }, "retrying...")
    }
    try {
      const result = await retryable()
      if (retryCount > 1) {
        log.warn({ retryCount }, "retrying succeeded")
      }
      return result
    } catch (error: unknown) {
      if (!shouldRetry(error, retryCount)) throw error
    }
  }
}
