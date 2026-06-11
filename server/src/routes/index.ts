import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { usersRouter } from "./users.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

// Future routers wire in here as they're built per the tracker:
//   apiRouter.use("/workspaces", workspacesRouter);
//   apiRouter.use("/documents", documentsRouter);
//   apiRouter.use("/notes", notesRouter);
//   apiRouter.use("/tasks", tasksRouter);
//   apiRouter.use("/files", filesRouter);
//   apiRouter.use("/notifications", notificationsRouter);
//   apiRouter.use("/analytics", analyticsRouter);