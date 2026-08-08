import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Defina a variável MONGODB_URI no .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const databaseName = process.env.NODE_ENV === "production" ? "feira-local-prod" : "feira-local";

    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: databaseName,
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}