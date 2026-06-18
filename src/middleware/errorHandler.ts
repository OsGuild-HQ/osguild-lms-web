import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, validationError } from '../lib/errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  const appError = err instanceof ZodError ? validationError(err) : err;

  if (appError instanceof AppError) {
    return res.status(appError.statusCode).json({
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details ?? [],
      },
    });
  }

  console.error(err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: [],
    },
  });
}
