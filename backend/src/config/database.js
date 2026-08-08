import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required to start the API.");

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? "fintrail",
  });
  console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
}
