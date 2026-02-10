import express from "express";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv"
import {GlobalErrorHandling} from "./contoller/ErrorContoller.js"
import cors from "cors"
import helmet from "helmet";
import {UpdateCheckAt} from "./utils/Montior.js"
import {CheckToken} from  "./middleware/isUser.js"
import {userRoute} from "./routes/UserRoute.js"
import {paymentRoute} from "./routes/PaymentRoute.js"
import {montiorRoute} from "./routes/MontiorRoute.js"
import {homeRoute} from "./routes/HomeRoute.js"
import {rateLimit} from "./routes/RateLimtingRoute.js"
import {CleanToken} from "./cron/CleanToken.js"
import {CheckCurrentMontiors} from "./cron/CheckMontiors.js"

const app = express();

dotenv.config()

// connect MongoDB

async function startServer() {
  await connectDB()

  // Env Varibles
  const PORT = process.env.PORT

  // Middlewares Lib
//   app.use(express.json())
//   const corsOptions = {
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   optionsSuccessStatus: 204
// };
// app.use(cors(corsOptions));
  // app.use((helmet as any)());


  //Middlewares
  app.use(CheckToken)

  // Routes
  app.use(userRoute)
  app.use("/payment",paymentRoute)
  app.use(montiorRoute)
  app.use(homeRoute)
  app.use(rateLimit)
  

  // Update All Montiors Time To Now
  await UpdateCheckAt()
  console.log("All Montiors Update CheckAt")

  //Corns 
  CleanToken()
  CheckCurrentMontiors()

  // Error Handling 
  app.use(GlobalErrorHandling)

  app.listen(PORT, () => {
    console.log("Server started...");
  });
}

startServer().catch((err) => {
  console.error(err)
  process.exit(1)
})
export default app