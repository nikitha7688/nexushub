import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { RefreshToken, type RefreshTokenDoc } from "../models/refresh-token.model.js";

export interface AccessTokenPayload {
  sub: string; // userId
  wsp: string; // workspaceId
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string") throw new Error("Invalid access token shape");
  return decoded as AccessTokenPayload;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseTtlMs(ttl: string): number {
  const m = ttl.match(/^(\d+)([smhd])$/);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const unit = m[2];
  const mult = unit === "s" ? 1_000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return n * mult;
}

export async function issueRefreshToken(
  userId: string,
  ctx: { userAgent?: string; ip?: string } = {},
): Promise<{ token: string; record: RefreshTokenDoc }> {
  const token = crypto.randomBytes(48).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + parseTtlMs(env.JWT_REFRESH_TTL));
  const record = (await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    userAgent: ctx.userAgent ?? "",
    ip: ctx.ip ?? "",
  })) as unknown as RefreshTokenDoc;
  return { token, record };
}

export async function rotateRefreshToken(
  presentedToken: string,
  ctx: { userAgent?: string; ip?: string } = {},
): Promise<{ userId: string; accessToken: string; refreshToken: string } | null> {
  const tokenHash = hashToken(presentedToken);
  const record = await RefreshToken.findOne({ tokenHash });
  if (!record) return null;
  if (record.revokedAt) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;

  // Issue new pair
  const userId = String(record.userId);
  const { token: newRefresh, record: newRecord } = await issueRefreshToken(userId, ctx);

  // Mark old as revoked + linked to new
  record.revokedAt = new Date();
  record.replacedById = newRecord._id;
  await record.save();

  // We need user fields for access token payload — caller can re-look up; here we keep token stateless.
  return {
    userId,
    accessToken: "", // caller signs access token (needs role + workspaceId)
    refreshToken: newRefresh,
  };
}

export async function revokeRefreshToken(presentedToken: string): Promise<boolean> {
  const tokenHash = hashToken(presentedToken);
  const res = await RefreshToken.updateOne(
    { tokenHash, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  return res.modifiedCount > 0;
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}