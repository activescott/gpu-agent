import { createDiag } from "@activescott/diag"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

const log = createDiag("shopping-agent:isomorphic:retry")

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

  log.warn(`transaction failed. checking if retryable...`, {
    prismaErrorCode: prismaError?.code,
    retryCount,
    err: error,
  })

  // https://www.prisma.io/docs/orm/reference/error-reference#error-codes
  if (
    retryCount < MAX_TRANSACTION_RETRIES &&
    prismaError?.code === TRANSACTION_DEADLOCK_OR_WRITE_CONFLICT
  ) {
    return true
  }

  log.error(`transaction failed permanently after ${retryCount} retries`, error)
  return false
}

export async function withRetry<T>(
  retryable: () => Promise<T>,
  shouldRetry: (err: unknown, retryCount: number) => boolean,
): Promise<T> {
  for (let retryCount = 0; ; retryCount++) {
    if (retryCount > 1) {
      log.warn(`retrying...`, { retryCount })
    }
    try {
      const result = await retryable()
      if (retryCount > 1) {
        log.warn(`retrying succeeded.`, { retryCount })
      }
      return result
    } catch (error: unknown) {
      if (!shouldRetry(error, retryCount)) throw error
    }
  }
}
