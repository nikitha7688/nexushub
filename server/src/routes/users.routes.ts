import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/require-auth.js";
import {
  adminDeleteUser,
  adminUpdateUser,
  adminUpdateUserSchema,
  changePassword,
  changePasswordSchema,
  getUserById,
  listUsers,
  toggleMfa,
  toggleMfaSchema,
  updateMe,
  updateMeSchema,
} from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/", asyncHandler(listUsers));

// `/me` routes must come before `/:id` so they aren't matched as ids.
usersRouter.patch("/me", validateBody(updateMeSchema), asyncHandler(updateMe));
usersRouter.post("/me/password", validateBody(changePasswordSchema), asyncHandler(changePassword));
usersRouter.post("/me/mfa", validateBody(toggleMfaSchema), asyncHandler(toggleMfa));

usersRouter.get("/:id", asyncHandler(getUserById));
usersRouter.patch("/:id", validateBody(adminUpdateUserSchema), asyncHandler(adminUpdateUser));
usersRouter.delete("/:id", asyncHandler(adminDeleteUser));