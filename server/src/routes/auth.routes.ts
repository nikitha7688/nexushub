import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/require-auth.js";
import {
  forgotPasswordSchema,
  getMe,
  loginSchema,
  logoutSchema,
  mfaSchema,
  oauthCallback,
  oauthRedirect,
  postForgotPassword,
  postLogin,
  postLogout,
  postMfa,
  postRefresh,
  postResetPassword,
  postSignup,
  postVerifyEmail,
  postVerifyResetCode,
  refreshSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
  verifyResetSchema,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), asyncHandler(postSignup));
authRouter.post("/verify-email", validateBody(verifyEmailSchema), asyncHandler(postVerifyEmail));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(postLogin));
authRouter.post("/login/mfa", validateBody(mfaSchema), asyncHandler(postMfa));
authRouter.post("/refresh", validateBody(refreshSchema), asyncHandler(postRefresh));
authRouter.post("/logout", validateBody(logoutSchema), asyncHandler(postLogout));

authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), asyncHandler(postForgotPassword));
authRouter.post("/forgot-password/verify", validateBody(verifyResetSchema), asyncHandler(postVerifyResetCode));
authRouter.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(postResetPassword));

authRouter.get("/me", requireAuth, asyncHandler(getMe));

// OAuth — stubs until provider apps + secrets are wired.
authRouter.get("/oauth/:provider", oauthRedirect);
authRouter.get("/oauth/:provider/callback", oauthCallback);