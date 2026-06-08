import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date, default: null },
    replacedById: { type: Schema.Types.ObjectId, ref: "RefreshToken", default: null },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true },
);

type RefreshTokenAttrs = InferSchemaType<typeof refreshTokenSchema>;
export type RefreshTokenDoc = HydratedDocument<RefreshTokenAttrs>;

export const RefreshToken = model("RefreshToken", refreshTokenSchema);