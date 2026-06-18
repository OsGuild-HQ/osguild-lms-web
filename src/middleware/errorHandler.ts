import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, validationError } from '../lib/errors';
import { logger, serializeError } from '../lib/logger';

/** Maps any thrown value to an AppError with an appropriate status and code. */
function toAppError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }

  if (err instanceof ZodError) {
    return validationError(err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025':
        return new AppError(404, 'NOT_FOUND', 'Resource not found');
      case 'P2002':
        return new AppError(409, 'CONFLICT', 'Resource already exists');
      default:
        break;
    }
  }

  return new AppError(500, 'INTERNAL_ERROR', 'Internal server error');
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // If the response has already started, defer to Express' default handler.
  if (res.headersSent) {
    return next(err);
  }

  const appError = toAppError(err);
  const isServerError = appError.statusCode >= 500;
  const log = req.log ?? logger;

  const meta = {
    method: req.method,
    path: req.originalUrl,
    status: appError.statusCode,
    code: appError.code,
  };

  if (isServerError) {
    // Log the original error (with stack) so the real cause isn't lost behind
    // the generic 500 message returned to the client.
    log.error('request errored', { ...meta, ...serializeError(err) });
  } else {
    log.warn('request rejected', { ...meta, reason: appError.message });
  }

  return res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      // Never leak internal error messages or details to clients on 5xx.
      message: isServerError ? 'Internal server error' : appError.message,
      details: isServerError ? [] : appError.details ?? [],
      requestId: req.id,
    },
  });
}
