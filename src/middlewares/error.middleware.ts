import { type Request, type Response, type NextFunction } from 'express';

import { AppError } from '@/common/errors/AppError';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
