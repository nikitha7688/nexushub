import type { RequestHandler } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import crypto from "node:crypto";
import { HttpError } from "../middleware/error-handler.js";
import { User, publicUser, type UserDoc } from "../models/user.model.js";
// UserDoc used by helpers below.
import { Workspace } from "../models/workspace.model.js";
import { hashPassword, verifyPassword } from "../services/password.service.js";
import { sendOtpEmail } from "../services/email.service.js";
import { issueOtp, verifyOtp } from "../services/otp.service.js";
import {
  buildRedirectUri,
  exchangeCodeForAccessToken,
  fetchUserInfo,
  getProviderConfig,
  isSupportedProvider,
  signState,
  verifyState,
  type OAuthProvider,
  type ProviderUserInfo,
} from "../services/oauth.service.js";
import { env } from "../config/env.js";
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

  // Pre-allocate user id so we can satisfy Workspace.ownerId at creation time.
  const userId = new Types.ObjectId();
  const workspace = await Workspace.create({ name: workspaceName, ownerId: userId });
  const user = await User.create({
    _id: userId,
    name,
    email,
    passwordHash,
    role: "Admin",
    workspaceId: workspace._id,
  });

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
  // OAuth-only accounts have no local password — same error to avoid leaking that fact.
  if (!user.passwordHash) throw new HttpError(401, "Invalid email or password");
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
  const user = await User.findById(req.auth.sub);
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: publicUser(user) });
};

// --- OAuth ---

function parseProvider(raw: string | undefined): OAuthProvider {
  const provider = (raw ?? "").toLowerCase();
  if (!isSupportedProvider(provider)) {
    throw new HttpError(400, `Unsupported OAuth provider: ${provider}`);
  }
  return provider;
}

async function findOrCreateOAuthUser(
  provider: OAuthProvider,
  info: ProviderUserInfo,
): Promise<UserDoc> {
  // 1) Existing link by (provider, providerUserId).
  const linked = await User.findOne({
    oauthProviders: { $elemMatch: { provider, providerUserId: info.providerUserId } },
  });
  if (linked) return linked;

  // 2) Existing user by email — link this provider to it.
  const byEmail = await User.findOne({ email: info.email });
  if (byEmail) {
    byEmail.oauthProviders.push({ provider, providerUserId: info.providerUserId });
    if (info.emailVerified && !byEmail.emailVerified) byEmail.emailVerified = true;
    if (!byEmail.avatarUrl && info.avatarUrl) byEmail.avatarUrl = info.avatarUrl;
    await byEmail.save();
    return byEmail;
  }

  // 3) Brand-new user — provision a workspace and make them Admin (matches local signup).
  const userId = new Types.ObjectId();
  const workspace = await Workspace.create({
    name: `${info.name}'s workspace`,
    ownerId: userId,
  });
  const user = await User.create({
    _id: userId,
    name: info.name,
    email: info.email,
    role: "Admin",
    workspaceId: workspace._id,
    emailVerified: info.emailVerified,
    avatarUrl: info.avatarUrl,
    oauthProviders: [{ provider, providerUserId: info.providerUserId }],
  });
  return user;
}

export const oauthRedirect: RequestHandler = (req, res) => {
  const provider = parseProvider(req.params.provider);
  const cfg = getProviderConfig(provider);

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: buildRedirectUri(provider),
    response_type: "code",
    scope: cfg.scope,
    state: signState(),
    access_type: "offline",
    prompt: "select_account",
  });
  res.redirect(`${cfg.authorizeUrl}?${params.toString()}`);
};

export const oauthCallback: RequestHandler = async (req, res) => {
  const provider = parseProvider(req.params.provider);

  // Provider may bounce back with `?error=access_denied&error_description=...`
  const providerError = typeof req.query.error === "string" ? req.query.error : null;
  if (providerError) {
    const desc = typeof req.query.error_description === "string" ? req.query.error_description : "";
    throw new HttpError(400, `OAuth provider error: ${providerError}${desc ? ` — ${desc}` : ""}`);
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  if (!code) throw new HttpError(400, "Missing authorization code");
  if (!verifyState(state)) throw new HttpError(400, "Invalid or expired OAuth state");

  const providerAccessToken = await exchangeCodeForAccessToken(provider, code);
  const info = await fetchUserInfo(provider, providerAccessToken);

  const user = await findOrCreateOAuthUser(provider, info);
  const tokens = await issueTokenPair(user, req);

  // Hand tokens to the frontend via URL fragment so they're never logged or sent to the server.
  const target = new URL(env.OAUTH_SUCCESS_REDIRECT);
  const hashParams = new URLSearchParams({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    provider,
  });
  target.hash = hashParams.toString();
  res.redirect(target.toString());
};