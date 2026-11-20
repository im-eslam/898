type LogData = Record<string, unknown>;
type Sink = (...args: unknown[]) => void;

class Logger {
  constructor(private readonly scope: string) {}

  info(message: string, data?: LogData): void {
    this.write(console.info, message, data);
  }

  warn(message: string, data?: LogData): void {
    this.write(console.warn, message, data);
  }

  error(message: string, data?: LogData): void {
    this.write(console.error, message, data);
  }

  private write(sink: Sink, message: string, data?: LogData): void {
    const line = `[${this.scope}] ${message}`;
    if (data) sink(line, data);
    else sink(line);
  }
}

export function createLogger(scope: string) {
  const logger = new Logger(scope);

  return {
    info: (message: string, data?: LogData) => logger.info(message, data),
    warn: (message: string, data?: LogData) => logger.warn(message, data),
    error: (message: string, data?: LogData) => logger.error(message, data),
  } as const;
}
