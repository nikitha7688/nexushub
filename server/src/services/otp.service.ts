import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { OneTimeCode, type OtpPurpose } from "../models/one-time-code.model.js";

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export function generateCode(): string {
  // 6-digit, leading-zero-safe.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function issueOtp(
  userId: string,
  purpose: OtpPurpose,
): Promise<string> {
  // Invalidate any active codes for this user + purpose
  await OneTimeCode.deleteMany({ userId, purpose });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await OneTimeCode.create({
    userId,
    codeHash,
    purpose,
    expiresAt: new Date(Date.now() + TTL_MS),
  });
  return code;
}

export async function verifyOtp(
  userId: string,
  purpose: OtpPurpose,
  code: string,
  opts: { consume?: boolean } = {},
): Promise<boolean> {
  const consume = opts.consume !== false;
  const otp = await OneTimeCode.findOne({ userId, purpose });
  if (!otp) return false;
  if (otp.expiresAt.getTime() < Date.now()) {
    await OneTimeCode.deleteOne({ _id: otp._id });
    return false;
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    await OneTimeCode.deleteOne({ _id: otp._id });
    return false;
  }

  const ok = await bcrypt.compare(code, otp.codeHash);
  if (!ok) {
    otp.attempts += 1;
    await otp.save();
    return false;
  }

  if (consume) {
    await OneTimeCode.deleteOne({ _id: otp._id });
  }
  return true;
}