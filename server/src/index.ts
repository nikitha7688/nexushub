import { createApp } from "./app.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { env } from "./config/env.js";

async function main() {
  await connectDb();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`✔ NexusHub API listening on http://localhost:${env.PORT}`);
    console.log(`  GET /api/health  →  health check`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down…`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced exit after 10s.");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});