import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["Admin", "Manager", "Developer", "Viewer"], default: "Admin" },
    department: { type: String, default: "" },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    emailVerified: { type: Boolean, default: false },
    mfaEnabled: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

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