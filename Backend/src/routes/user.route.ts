import express, { Router } from "express"
import { createUser, login, createCode, checkCode, updatePassword } from "../controllers/user.controller.js"

export const userRoute = express.Router()

userRoute.post("/CreateUser", createUser)
userRoute.post("/Login", login)
userRoute.post("/CheckForgetPasswordCode", checkCode)
userRoute.post("/CreateCode", createCode)
userRoute.post("/UpdatePassword", updatePassword)
