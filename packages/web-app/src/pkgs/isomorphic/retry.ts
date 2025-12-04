import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:isomorphic:retry")

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
