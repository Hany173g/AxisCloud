
import express, { Router } from "express"


import {CreateUser,Login,CreateCode,CheckCode,UpdatePassword} from "../contoller/User.js"

export let userRoute = express.Router()









userRoute.post("/CreateUser",CreateUser)
userRoute.post("/Login",Login)
userRoute.post("/CheckCode",CheckCode)
userRoute.post("/CreateCode",CreateCode)
userRoute.post("/UpdatePassword",UpdatePassword)









