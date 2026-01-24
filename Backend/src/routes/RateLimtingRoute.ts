import express, { Router } from "express"
import { CreateRateLimting ,CreateLog} from "../contoller/RateLimtingContoller.js"
export let rateLimit = express.Router()
















rateLimit.post("/CreateRateLimting",CreateRateLimting)
rateLimit.post("/CreateLog" , CreateLog)

