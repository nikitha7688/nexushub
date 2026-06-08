import type { RequestHandler } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { HttpError } from "../middleware/error-handler.js";
import { User, publicUser, type UserDoc } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { hashPassword, verifyPassword } from "../services/password.service.js";
import { sendOtpEmail } from "../services/email.service.js";
import { issueOtp, verifyOtp } from "../services/otp.service.js";
// issueOtp is used by signup/login/forgot flows; verifyOtp by verify/mfa/reset.
import {
  issueRefreshToken,
  revokeAllUserTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  type AccessTokenPayload,
} from "../services/token.service.js";

// --- Schemas ---

export const signupSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(200),
  workspaceName: z.string().min(1).max(120),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/, "Must be 6 digits"),
});

export const mfaSchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "Must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const verifyResetSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/, "Must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/, "Must be 6 digits"),
  newPassword: z.string().min(8).max(200),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

// --- Helpers ---

function buildAccessPayload(user: UserDoc): AccessTokenPayload {
  return {
    sub: String(user._id),
    wsp: String(user.workspaceId),
    role: user.role,
  };
}

async function issueTokenPair(user: UserDoc, req: Parameters<RequestHandler>[0]) {
  const accessToken = signAccessToken(buildAccessPayload(user));
  const { token: refreshToken } = await issueRefreshToken(String(user._id), {
    userAgent: req.headers["user-agent"] ?? "",
    ip: req.ip ?? "",
  });
  return { accessToken, refreshToken };
}

// In-memory challenge store for the MFA step. In real prod this would be Redis with TTL.
// Key = challengeId; Value = { userId, expiresAt }.
const mfaChallenges = new Map<string, { userId: string; expiresAt: number }>();
function purgeChallenges() {
  const now = Date.now();
  for (const [k, v] of mfaChallenges) if (v.expiresAt < now) mfaChallenges.delete(k);
}

// --- Handlers ---

export const postSignup: RequestHandler = async (req, res) => {
  const { name, email, password, workspaceName } = req.body as z.infer<typeof signupSchema>;

  if (await User.findOne({ email })) {
    throw new HttpError(409, "An account with that email already exists");
  }

  const passwordHash = await hashPassword(password);

  // Create workspace, then user that owns it
  const workspace = await Workspace.create({ name: workspaceName, ownerId: null });
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "Admin",
    workspaceId: workspace._id,
  });
  workspace.ownerId = user._id;
  await workspace.save();

  // Send email verification OTP
  const code = await issueOtp(String(user._id), "verify_email");
  await sendOtpEmail(email, code, "verify_email");

  res.status(201).json({
    user: publicUser(user),
    workspace: { id: String(workspace._id), name: workspace.name },
    requiresEmailVerification: true,
  });
};

export const postVerifyEmail: RequestHandler = async (req, res) => {
  const { email, code } = req.body as z.infer<typeof verifyEmailSchema>;
  const user = await User.findOne({ email });
  if (!user) throw new HttpError(404, "No account for that email");

  const ok = await verifyOtp(String(user._id), "verify_email", code);
  if (!ok) throw new HttpError(400, "Invalid or expired code");

  user.emailVerified = true;
  await user.save();

  const tokens = await issueTokenPair(user, req);
  res.json({ user: publicUser(user), ...tokens });
};

export const postLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) throw new HttpError(401, "Invalid email or password");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid email or password");

  if (!user.emailVerified) {
    throw new HttpError(403, "Email not verified", { requiresEmailVerification: true });
  }

  if (user.mfaEnabled) {
    // Issue a short-lived challenge id + email OTP for the MFA step
    purgeChallenges();
    const challengeId = crypto.randomBytes(16).toString("base64url");
    mfaChallenges.set(challengeId, {
      userId: String(user._id),
      expiresAt: Date.now() + 10 * 60_000,
    });
    const code = await issueOtp(String(user._id), "mfa_login");
    await sendOtpEmail(user.email, code, "mfa_login");
    return res.json({ mfaRequired: true, challengeId });
  }

  const tokens = await issueTokenPair(user, req);
  res.json({ user: publicUser(user), ...tokens });
};

export const postMfa: RequestHandler = async (req, res) => {
  const { challengeId, code } = req.body as z.infer<typeof mfaSchema>;
  purgeChallenges();
  const challenge = mfaChallenges.get(challengeId);
  if (!challenge) throw new HttpError(400, "Invalid or expired challenge");

  const ok = await verifyOtp(challenge.userId, "mfa_login", code);
  if (!ok) throw new HttpError(400, "Invalid or expired code");
  mfaChallenges.delete(challengeId);

  const user = await User.findById(challenge.userId);
  if (!user) throw new HttpError(404, "User not found");

  const tokens = await issueTokenPair(user, req);
  res.json({ user: publicUser(user), ...tokens });
};

export const postRefresh: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
  const result = await rotateRefreshToken(refreshToken, {
    userAgent: req.headers["user-agent"] ?? "",
    ip: req.ip ?? "",
  });
  if (!result) throw new HttpError(401, "Refresh token invalid or expired");

  const user = await User.findById(result.userId);
  if (!user) throw new HttpError(404, "User not found");

  const accessToken = signAccessToken(buildAccessPayload(user));
  res.json({ accessToken, refreshToken: result.refreshToken });
};

export const postLogout: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body as z.infer<typeof logoutSchema>;
  const ok = await revokeRefreshToken(refreshToken);
  res.json({ ok });
};

export const postForgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body as z.infer<typeof forgotPasswordSchema>;
  // Always respond OK to avoid email enumeration
  const user = await User.findOne({ email });
  if (user) {
    const code = await issueOtp(String(user._id), "password_reset");
    await sendOtpEmail(email, code, "password_reset");
  }
  res.json({ ok: true });
};

export const postVerifyResetCode: RequestHandler = async (req, res) => {
  // Verify without consuming — the same code is reused by the reset step.
  const { email, code } = req.body as z.infer<typeof verifyResetSchema>;
  const user = await User.findOne({ email });
  if (!user) throw new HttpError(400, "Invalid email or code");

  const ok = await verifyOtp(String(user._id), "password_reset", code, { consume: false });
  if (!ok) throw new HttpError(400, "Invalid or expired code");
  res.json({ ok: true });
};

export const postResetPassword: RequestHandler = async (req, res) => {
  const { email, code, newPassword } = req.body as z.infer<typeof resetPasswordSchema>;
  const user = await User.findOne({ email });
  if (!user) throw new HttpError(400, "Invalid email or code");

  const ok = await verifyOtp(String(user._id), "password_reset", code);
  if (!ok) throw new HttpError(400, "Invalid or expired code");

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  await revokeAllUserTokens(String(user._id));

  const tokens = await issueTokenPair(user, req);
  res.json({ user: publicUser(user), ...tokens });
};

export const getMe: RequestHandler = async (req, res) => {
  if (!req.auth) throw new HttpError(401, "Unauthenticated");
  const user = (await User.findById(req.auth.sub)) as UserDoc | null;
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: publicUser(user) });
};

// --- OAuth stubs (real provider wiring lands in the "Auth → OAuth" tracker item) ---

export const oauthRedirect: RequestHandler = (req, _res, next) => {
  const provider = req.params.provider;
  next(
    new HttpError(
      501,
      `OAuth (${provider}) is not configured yet. Set ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET, then wire the redirect to the provider's consent URL.`,
    ),
  );
};

export const oauthCallback: RequestHandler = (req, _res, next) => {
  const provider = req.params.provider;
  next(new HttpError(501, `OAuth (${provider}) callback not implemented yet.`));
};