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
import forceHttpsMiddleware from "./middleware/force-https.middleware.js"
import fs from "fs"
import https from "https"
import http from "http"
const app = express();

dotenv.config()



// Options force https

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};


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
  app.use(forceHttpsMiddleware)

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
  // await clie nt.connect()
  initRoutesOnce()
  await updateCheckAt()
  cleanToken()
  checkCurrentMonitors()

  // Env Varibles
  const PORT_HTTPS = process.env.PORT_HTTPS
  const PORT_HTTP = process.env.PORT_HTTP

  https.createServer(options,app).listen(PORT_HTTPS, () => {
    console.log(`Server is running on port ${PORT_HTTPS}`)
  })
  http.createServer(app).listen(PORT_HTTP, () => {
    console.log(`Server is running on port ${PORT_HTTP}`)
  })
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error(err)

  })
}

export default function handler(req: any, res: any) {
  // Ensure routes are registered for serverless usage
  initRoutesOnce()
  return connectDB().then(() => app(req, res))
}