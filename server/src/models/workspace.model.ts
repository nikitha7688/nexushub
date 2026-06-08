import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    department: { type: String, default: "" },
    teamSize: { type: String, default: "" },
    features: { type: [String], default: ["docs", "notes", "tasks", "collab", "files"] },
  },
  { timestamps: true },
);

type WorkspaceAttrs = InferSchemaType<typeof workspaceSchema>;
export type WorkspaceDoc = HydratedDocument<WorkspaceAttrs>;

export const Workspace = model("Workspace", workspaceSchema);