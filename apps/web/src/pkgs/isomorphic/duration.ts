/* eslint-disable import/no-unused-modules, no-magic-numbers */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const EPOCH = new Date(0)
const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60

export const secondsToMilliseconds = (seconds: number) =>
  seconds * MILLISECONDS_PER_SECOND

export const millisecondsToSeconds = (milliseconds: number) =>
  milliseconds / MILLISECONDS_PER_SECOND

export const hoursToMilliseconds = (hours: number) =>
  hours * 60 * 60 * MILLISECONDS_PER_SECOND

export const minutesToSeconds = (minutes: number) =>
  minutes * SECONDS_PER_MINUTE

export const hoursToSeconds = (hours: number) =>
  hours * MINUTES_PER_HOUR * SECONDS_PER_MINUTE
