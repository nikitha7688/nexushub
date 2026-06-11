import type { RequestHandler } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { HttpError } from "../middleware/error-handler.js";
import { User, publicUser } from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../services/password.service.js";
import { revokeAllUserTokens } from "../services/token.service.js";

// --- Schemas ---

const roleSchema = z.enum(["Admin", "Manager", "Developer", "Viewer"]);

export const updateMeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  department: z.string().max(120).optional(),
  avatarUrl: z.string().url().max(2048).optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export const toggleMfaSchema = z.object({
  enabled: z.boolean(),
});

export const adminUpdateUserSchema = z.object({
  role: roleSchema.optional(),
  department: z.string().max(120).optional(),
});

// --- Helpers ---

function requireAuthCtx(req: Parameters<RequestHandler>[0]) {
  if (!req.auth) throw new HttpError(401, "Unauthenticated");
  return req.auth;
}

function requireAdmin(req: Parameters<RequestHandler>[0]) {
  const ctx = requireAuthCtx(req);
  if (ctx.role !== "Admin") throw new HttpError(403, "Admin role required");
  return ctx;
}

function requireObjectIdParam(raw: string | undefined, label = "id"): string {
  if (!raw || !Types.ObjectId.isValid(raw)) throw new HttpError(400, `Invalid ${label}`);
  return raw;
}

// --- Handlers ---

export const listUsers: RequestHandler = async (req, res) => {
  const ctx = requireAuthCtx(req);
  const users = await User.find({ workspaceId: ctx.wsp }).sort({ createdAt: 1 });
  res.json({ users: users.map(publicUser) });
};

export const getUserById: RequestHandler = async (req, res) => {
  const ctx = requireAuthCtx(req);
  const id = requireObjectIdParam(req.params.id);
  const user = await User.findOne({ _id: id, workspaceId: ctx.wsp });
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: publicUser(user) });
};

export const updateMe: RequestHandler = async (req, res) => {
  const ctx = requireAuthCtx(req);
  const body = req.body as z.infer<typeof updateMeSchema>;

  const user = await User.findById(ctx.sub);
  if (!user) throw new HttpError(404, "User not found");

  if (body.name !== undefined) user.name = body.name;
  if (body.department !== undefined) user.department = body.department;
  if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl;

  await user.save();
  res.json({ user: publicUser(user) });
};

export const changePassword: RequestHandler = async (req, res) => {
  const ctx = requireAuthCtx(req);
  const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;

  const user = await User.findById(ctx.sub).select("+passwordHash");
  if (!user) throw new HttpError(404, "User not found");
  if (!user.passwordHash) {
    throw new HttpError(400, "This account has no password (OAuth login). Use the reset flow to set one.");
  }
  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw new HttpError(401, "Current password is incorrect");

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  // Force re-login on other sessions after a password change.
  await revokeAllUserTokens(String(user._id));

  res.json({ ok: true });
};

export const toggleMfa: RequestHandler = async (req, res) => {
  const ctx = requireAuthCtx(req);
  const { enabled } = req.body as z.infer<typeof toggleMfaSchema>;

  const user = await User.findById(ctx.sub);
  if (!user) throw new HttpError(404, "User not found");

  user.mfaEnabled = enabled;
  await user.save();
  res.json({ user: publicUser(user) });
};

export const adminUpdateUser: RequestHandler = async (req, res) => {
  const ctx = requireAdmin(req);
  const id = requireObjectIdParam(req.params.id);
  const body = req.body as z.infer<typeof adminUpdateUserSchema>;

  const user = await User.findOne({ _id: id, workspaceId: ctx.wsp });
  if (!user) throw new HttpError(404, "User not found");

  // Last-admin guard: don't let an Admin demote themselves if they're the only Admin in the workspace.
  if (body.role && body.role !== "Admin" && String(user._id) === ctx.sub) {
    const otherAdmins = await User.countDocuments({
      workspaceId: ctx.wsp,
      role: "Admin",
      _id: { $ne: user._id },
    });
    if (otherAdmins === 0) {
      throw new HttpError(400, "Cannot demote the last Admin in the workspace");
    }
  }

  if (body.role !== undefined) user.role = body.role;
  if (body.department !== undefined) user.department = body.department;

  await user.save();
  res.json({ user: publicUser(user) });
};

export const adminDeleteUser: RequestHandler = async (req, res) => {
  const ctx = requireAdmin(req);
  const id = requireObjectIdParam(req.params.id);

  if (id === ctx.sub) {
    throw new HttpError(400, "Admins cannot delete themselves");
  }

  const user = await User.findOne({ _id: id, workspaceId: ctx.wsp });
  if (!user) throw new HttpError(404, "User not found");

  await User.deleteOne({ _id: user._id });
  await revokeAllUserTokens(String(user._id));
  res.json({ ok: true });
};