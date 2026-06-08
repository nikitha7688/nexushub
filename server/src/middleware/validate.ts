import type { RequestHandler } from "express";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { HttpError } from "./error-handler.js";

export function validateBody<S extends ZodTypeAny>(schema: S): RequestHandler {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req.body) as z.infer<S>;
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new HttpError(400, "Invalid request body", err.flatten().fieldErrors));
      }
      next(err);
    }
  };
}