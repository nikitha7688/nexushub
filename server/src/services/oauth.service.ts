import crypto from "node:crypto";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/error-handler.js";

export type OAuthProvider = "google" | "microsoft";

export interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  clientId: string;
  clientSecret: string;
}

export interface ProviderUserInfo {
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatarUrl: string;
}

export function isSupportedProvider(p: string): p is OAuthProvider {
  return p === "google" || p === "microsoft";
}

export function getProviderConfig(provider: OAuthProvider): ProviderConfig {
  if (provider === "google") {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new HttpError(
        503,
        "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      );
    }
    return {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      scope: "openid email profile",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }
  // microsoft
  if (!env.MICROSOFT_CLIENT_ID || !env.MICROSOFT_CLIENT_SECRET) {
    throw new HttpError(
      503,
      "Microsoft OAuth is not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET.",
    );
  }
  const tenant = env.MICROSOFT_TENANT;
  return {
    authorizeUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    // Microsoft Graph "me" endpoint returns id/displayName/mail/userPrincipalName.
    userInfoUrl: "https://graph.microsoft.com/v1.0/me",
    scope: "openid email profile User.Read",
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: env.MICROSOFT_CLIENT_SECRET,
  };
}

export function buildRedirectUri(provider: OAuthProvider): string {
  return `${env.PUBLIC_API_URL.replace(/\/$/, "")}/api/auth/oauth/${provider}/callback`;
}

// --- State (CSRF) ---
//
// State is a base64url JSON `{n: nonce, t: timestamp}` plus an HMAC tag. We verify the HMAC and
// timestamp freshness on callback. No server-side store — fine for dev. For prod, bind state to a
// short-lived cookie or Redis entry to prevent replay within the freshness window.

const STATE_TTL_MS = 10 * 60_000;

export function signState(): string {
  const payload = { n: crypto.randomBytes(16).toString("base64url"), t: Date.now() };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", env.OAUTH_STATE_SECRET).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifyState(state: string): boolean {
  const parts = state.split(".");
  if (parts.length !== 2) return false;
  const body = parts[0]!;
  const mac = parts[1]!;
  const expected = crypto.createHmac("sha256", env.OAUTH_STATE_SECRET).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      t?: number;
    };
    if (typeof payload.t !== "number") return false;
    return Date.now() - payload.t < STATE_TTL_MS;
  } catch {
    return false;
  }
}

// --- Token exchange ---

export async function exchangeCodeForAccessToken(
  provider: OAuthProvider,
  code: string,
): Promise<string> {
  const cfg = getProviderConfig(provider);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: buildRedirectUri(provider),
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });
  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new HttpError(502, `OAuth token exchange failed (${provider}): ${res.status} ${detail.slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new HttpError(502, `OAuth token exchange returned no access_token (${provider})`);
  }
  return json.access_token;
}

// --- User info ---

interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

interface MicrosoftUserInfo {
  id: string;
  displayName?: string;
  mail?: string | null;
  userPrincipalName?: string;
}

export async function fetchUserInfo(
  provider: OAuthProvider,
  accessToken: string,
): Promise<ProviderUserInfo> {
  const cfg = getProviderConfig(provider);
  const res = await fetch(cfg.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new HttpError(502, `OAuth userinfo failed (${provider}): ${res.status} ${detail.slice(0, 200)}`);
  }

  if (provider === "google") {
    const u = (await res.json()) as GoogleUserInfo;
    if (!u.sub || !u.email) {
      throw new HttpError(502, "Google userinfo missing sub/email");
    }
    return {
      providerUserId: u.sub,
      email: u.email.toLowerCase(),
      emailVerified: !!u.email_verified,
      name: u.name ?? u.email,
      avatarUrl: u.picture ?? "",
    };
  }

  const u = (await res.json()) as MicrosoftUserInfo;
  const email = (u.mail ?? u.userPrincipalName ?? "").toLowerCase();
  if (!u.id || !email) {
    throw new HttpError(502, "Microsoft userinfo missing id/email");
  }
  return {
    providerUserId: u.id,
    email,
    // Microsoft Graph /me doesn't expose a verified flag — treat tenant accounts as verified.
    emailVerified: true,
    name: u.displayName ?? email,
    avatarUrl: "",
  };
}