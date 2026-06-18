export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  /** Returns a logger that includes `bindings` on every log line. */
  child(bindings: LogContext): Logger;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const isProduction = process.env.NODE_ENV === 'production';
const configuredLevel = (process.env.LOG_LEVEL as LogLevel) || (isProduction ? 'info' : 'debug');
const threshold = LEVEL_WEIGHT[configuredLevel] ?? LEVEL_WEIGHT.info;

/** Normalizes any thrown value into a loggable, JSON-safe shape. */
export function serializeError(err: unknown): LogContext {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }

  return { message: String(err) };
}

function emit(level: LogLevel, message: string, context: LogContext) {
  if (LEVEL_WEIGHT[level] < threshold) {
    return;
  }

  const entry = { time: new Date().toISOString(), level, message, ...context };
  const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;

  if (isProduction) {
    stream.write(`${JSON.stringify(entry)}\n`);
    return;
  }

  const hasContext = Object.keys(context).length > 0;
  const suffix = hasContext ? ` ${JSON.stringify(context)}` : '';
  stream.write(`${entry.time} ${level.toUpperCase().padEnd(5)} ${message}${suffix}\n`);
}

function createLogger(bindings: LogContext = {}): Logger {
  const log = (level: LogLevel, message: string, context?: LogContext) =>
    emit(level, message, { ...bindings, ...context });

  return {
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, context) => log('error', message, context),
    child: (childBindings) => createLogger({ ...bindings, ...childBindings }),
  };
}

export const logger = createLogger();
