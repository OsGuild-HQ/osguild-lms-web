import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Logger, logger } from '../lib/logger';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Correlation id for this request, echoed back in the `x-request-id` header. */
      id: string;
      /** Request-scoped logger pre-bound with the correlation id. */
      log: Logger;
    }
  }
}

/**
 * Assigns a correlation id to every request, exposes a request-scoped logger as
 * `req.log`, and logs a single line when the response finishes (with status and
 * duration). Replaces morgan with structured, correlated logging.
 */
export function requestContext(req: Request, res: Response, next: NextFunction) {
  const id = req.header('x-request-id') || randomUUID();

  req.id = id;
  req.log = logger.child({ requestId: id });
  res.setHeader('x-request-id', id);

  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    req.log[level]('request completed', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    });
  });

  next();
}
