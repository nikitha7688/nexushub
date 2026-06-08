import type { RequestHandler } from "express";
import { HttpError } from "./error-handler.js";
import { verifyAccessToken } from "../services/token.service.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return next(new HttpError(401, "Missing bearer token"));
  }
  const token = header.slice(7).trim();
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch (err) {
    next(new HttpError(401, "Invalid or expired token"));
  }
};