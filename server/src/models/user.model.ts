import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const oauthProviderSchema = new Schema(
  {
    provider: { type: String, enum: ["google", "microsoft"], required: true },
    providerUserId: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    // Optional: OAuth-only users won't have a local password.
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["Admin", "Manager", "Developer", "Viewer"], default: "Admin" },
    department: { type: String, default: "" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    emailVerified: { type: Boolean, default: false },
    mfaEnabled: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    oauthProviders: { type: [oauthProviderSchema], default: [] },
  },
  { timestamps: true },
);

userSchema.index({ "oauthProviders.provider": 1, "oauthProviders.providerUserId": 1 });

type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserAttrs>;

export const User = model("User", userSchema);

export function publicUser(u: UserDoc) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    workspaceId: String(u.workspaceId),
    emailVerified: u.emailVerified,
    mfaEnabled: u.mfaEnabled,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
  };
}