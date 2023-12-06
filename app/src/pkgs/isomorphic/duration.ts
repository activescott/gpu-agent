// eslint-disable-next-line import/no-unused-modules
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const MILLISECONDS_PER_SECOND = 1000

export const secondsToMilliseconds = (seconds: number) =>
  seconds * MILLISECONDS_PER_SECOND
