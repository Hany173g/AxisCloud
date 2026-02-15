import express from "express";
import { connectDB } from "../src/config/database.js";
import dotenv from "dotenv";
import { GlobalErrorHandling } from "../src/contoller/ErrorContoller.js";
import helmet from "helmet";
import { CheckToken } from "../src/middleware/isUser.js";
import { userRoute } from "../src/routes/UserRoute.js";
import { paymentRoute } from "../src/routes/PaymentRoute.js";
import { montiorRoute } from "../src/routes/MontiorRoute.js";
import { homeRoute } from "../src/routes/HomeRoute.js";
import { rateLimit } from "../src/routes/RateLimtingRoute.js";
import corsMiddleware from "../src/middleware/corsMiddleware.js";

dotenv.config();

const app = express();

// Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use((helmet as any)());

// Auth middleware
app.use(CheckToken);

// Routes
app.use(userRoute);
app.use("/payment", paymentRoute);
app.use(montiorRoute);
app.use(homeRoute);
app.use(rateLimit);

// Error Handling
app.use(GlobalErrorHandling);

// Vercel serverless handler
let dbConnected = false;

export default async function handler(req: any, res: any) {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  return app(req, res);
}
