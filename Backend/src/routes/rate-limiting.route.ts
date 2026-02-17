import express, { Router } from "express"
import { createRateLimiting, createLog } from "../controllers/rate-limiting.controller.js"

export const rateLimitRoute = express.Router()

rateLimitRoute.post("/CreateRateLimiting", createRateLimiting)
rateLimitRoute.post("/CreateLog", createLog)
