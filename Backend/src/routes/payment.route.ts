import express, { Router } from "express"
import { upgradeToPro, captureOrder } from "../controllers/payment.controller.js"

export const paymentRoute = express.Router()

paymentRoute.post("/upgradePro", upgradeToPro)
paymentRoute.post("/CaptureOrder", captureOrder)
