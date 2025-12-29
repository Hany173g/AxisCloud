import express from "express";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv"
import {GlobalErrorHandling} from "./contoller/ErrorContoller.js"
import cors from "cors"
const app = express();

// connect MongoDB
connectDB();




//Server Settings


dotenv.config()
app.use(express.json())


  //Cors
let corsOptions = {
   origin: process.env.FRONTEND_URL,
   methods: ["GET", "POST", "PUT", "DELETE"],
}



app.use(cors(corsOptions))





// Env Varibles


const PORT = process.env.PORT





//Middlewares
import {CheckToken} from  "./middleware/isUser.js"


app.use(CheckToken)




// Routes

import {userRoute} from "./routes/User.js"

import {montiorRoute} from "./routes/MontiorRoute.js"




app.use(userRoute)

app.use(montiorRoute)

//Corns 

import {CleanToken} from "./cron/CleanToken.js"
import {CheckCurrentMontiors} from "./cron/CheckMontiors.js"

CleanToken()
// CheckCurrentMontiors()










// Error Handling 


app.use(GlobalErrorHandling)










app.listen(PORT, () => {
  console.log("Server started...");
});
