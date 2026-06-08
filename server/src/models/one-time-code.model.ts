import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

export type OtpPurpose = "verify_email" | "mfa_login" | "password_reset";

const otpSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["verify_email", "mfa_login", "password_reset"], required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true },
);

type OtpAttrs = InferSchemaType<typeof otpSchema>;
export type OneTimeCodeDoc = HydratedDocument<OtpAttrs>;

export const OneTimeCode = model("OneTimeCode", otpSchema);