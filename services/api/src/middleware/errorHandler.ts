import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const uuidv4 = () => crypto.randomUUID();

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = uuidv4();
  
  console.error('Error:', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
  }
  
  // Unexpected errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
  });
};
