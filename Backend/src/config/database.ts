import mongoose from "mongoose";
import dotenv from "dotenv"



dotenv.config()

export const connectDB = async () => {
  try {
    let MONGO_URI : string | undefined = process.env.MONGO_URI ?? "mongodb://localhost:27017/backupAxis"
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};