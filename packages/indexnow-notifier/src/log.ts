/**
 * Simple console-based logger
 */
export interface Logger {
  info: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
  debug: (message: string, ...args: unknown[]) => void
}

export function createLogger(prefix: string): Logger {
  const format = (level: string, message: string): string =>
    `[${new Date().toISOString()}] [${level}] [${prefix}] ${message}`

  return {
    info: (message: string, ...args: unknown[]) =>
      console.log(format("INFO", message), ...args),
    warn: (message: string, ...args: unknown[]) =>
      console.warn(format("WARN", message), ...args),
    error: (message: string, ...args: unknown[]) =>
      console.error(format("ERROR", message), ...args),
    debug: (message: string, ...args: unknown[]) => {
      if (process.env.DEBUG) {
        console.log(format("DEBUG", message), ...args)
      }
    },
  }
}
