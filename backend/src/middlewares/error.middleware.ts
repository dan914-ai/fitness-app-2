import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: 'error'
    });
    return;
  }

  // Prisma errors
  if (err.message.includes('P2002')) {
    res.status(409).json({
      error: 'Duplicate entry',
      status: 'error'
    });
    return;
  }

  if (err.message.includes('P2025')) {
    res.status(404).json({
      error: 'Record not found',
      status: 'error'
    });
    return;
  }

  // Default error
  console.error('Unexpected error:', err);
  res.status(500).json({
    error: 'Internal server error',
    status: 'error'
  });
};