import type { RequestHandler } from "express";

// Express 4 doesn't catch errors thrown from async handlers. Wrap every async
// route in this to forward rejections to the central error middleware.
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}