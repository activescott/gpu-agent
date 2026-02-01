import pino from "pino"

const level =
  process.env.LOG_LEVEL ??
  (process.env.NODE_ENV === "production" ? "info" : "debug")

const logger = pino({ name: "gpupoet", level })

export function createLogger(name: string) {
  return logger.child({ module: name })
}
