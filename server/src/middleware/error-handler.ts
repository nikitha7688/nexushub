import type { ErrorRequestHandler, RequestHandler } from "express";

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal server error";

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} →`, err);
  }

  res.status(status).json({
    error: {
      message,
      status,
      details: err instanceof HttpError ? err.details : undefined,
    },
  });
};