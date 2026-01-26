import pino from "pino"

const level =
  process.env.LOG_LEVEL ??
  (process.env.NODE_ENV === "production" ? "info" : "debug")

export const logger = pino({ name: "ebay-client", level })

export function createLogger(name: string): pino.Logger {
  return logger.child({ module: name })
}

export type Logger = pino.Logger
