type LogLevel = "debug" | "info" | "warn" | "error"

interface LoggerOptions {
  level: LogLevel
  enabled: boolean
}

class Logger {
  private options: LoggerOptions

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      level: options.level || "info",
      enabled: options.enabled !== undefined ? options.enabled : import.meta.env.MODE !== "production",
    }
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.options.enabled) return

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }

    if (levels[level] < levels[this.options.level]) return

    const timestamp = new Date().toISOString()
    const formattedData = data ? JSON.stringify(data, null, 2) : ""

    const logFn =
      level === "error"
        ? console.error
        : level === "warn"
          ? console.warn
          : level === "debug"
            ? console.debug
            : console.log

    logFn(`[${timestamp}] [${level.toUpperCase()}] ${message}${formattedData ? "\n" + formattedData : ""}`)
  }

  debug(message: string, data?: any): void {
    this.log("debug", message, data)
  }

  info(message: string, data?: any): void {
    this.log("info", message, data)
  }

  warn(message: string, data?: any): void {
    this.log("warn", message, data)
  }

  error(message: string, data?: any): void {
    this.log("error", message, data)
  }
}

export const logger = new Logger()
