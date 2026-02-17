import express from "express";
import { connectDB } from "./config/database.config.js";
import dotenv from "dotenv"
import { globalErrorHandling } from "./controllers/error.controller.js"
import helmet from "helmet";
import { updateCheckAt } from "./utils/monitor.util.js"
import { checkToken } from "./middleware/auth.middleware.js"
import { userRoute } from "./routes/user.route.js"
import { paymentRoute } from "./routes/payment.route.js"
import { monitorRoute } from "./routes/monitor.route.js"
import { homeRoute } from "./routes/home.route.js"
import { rateLimitRoute } from "./routes/rate-limiting.route.js"
import { cleanToken } from "./cron/clean-token.cron.js"
import { checkCurrentMonitors } from "./cron/check-monitors.cron.js"
import corsMiddleware from "./middleware/cors.middleware.js"
import client from "./config/redis.config.js"
const app = express();

dotenv.config()

// connect MongoDB

let routesInitialized = false
function initRoutesOnce() {
  if (routesInitialized) return

  // Middlewares Lib
  app.use(corsMiddleware)
  app.use(express.json())
  app.use((helmet as any)())

  //Middlewares
  app.use(checkToken)

  // Routes
  app.use("/api",userRoute)
  app.use("/api/payment", paymentRoute)
  app.use("/api/monitor",monitorRoute)
  app.use("/api",homeRoute)
  app.use(rateLimitRoute)
  // Error Handling
  app.use(globalErrorHandling)

  routesInitialized = true
}
async function startServer() {
  await connectDB()
  await client.connect()
  initRoutesOnce()
  await updateCheckAt()
  cleanToken()
  checkCurrentMonitors()

  // Env Varibles
  const PORT = process.env.PORT

  app.listen(PORT, () => {
    console.log("Server started...")
  })
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

export default function handler(req: any, res: any) {
  // Ensure routes are registered for serverless usage
  initRoutesOnce()
  return connectDB().then(() => app(req, res))
}