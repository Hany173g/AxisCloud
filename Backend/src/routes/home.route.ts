import express, { Router } from "express"
import { getHome } from "../controllers/home.controller.js"

export const homeRoute = express.Router()

homeRoute.get("/getHome", getHome)
