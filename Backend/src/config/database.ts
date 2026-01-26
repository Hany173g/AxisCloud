import mongoose from "mongoose";
import dotenv from "dotenv"



dotenv.config()

export const connectDB = async () => {
  try {
    let MONGO_URI : string  = process.env.DATABASE_URL ?? "mongodb://localhost:27017/backupAxis"
    console.log("mongourl from vairble " , MONGO_URI , "env", process.env.DATABASE_URL)
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};