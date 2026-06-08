import mongoose from "mongoose";
import { env } from "./env.js";

let connected = false;

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    connected = true;
    console.log(`✔ Mongo connected → ${redact(env.MONGODB_URI)}`);
  } catch (err) {
    connected = false;
    console.warn(
      `⚠ Mongo unavailable at ${redact(env.MONGODB_URI)} — server will start, but DB-backed routes will fail.\n  ${err instanceof Error ? err.message : err}`,
    );
  }

  mongoose.connection.on("disconnected", () => {
    connected = false;
    console.warn("⚠ Mongo disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    connected = true;
    console.log("✔ Mongo reconnected");
  });
}

export function isDbConnected() {
  return connected && mongoose.connection.readyState === 1;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

function redact(uri: string) {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/, "$1$2:****@");
}