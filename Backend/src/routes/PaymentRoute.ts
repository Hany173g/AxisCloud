
import express, { Router } from "express"
import {UpgradeToPro,CaptureOrder} from "../contoller/PaymentContoller.js"

import {CreateUser,Login,CreateCode,CheckCode,UpdatePassword} from "../contoller/User.js"

export let paymentRoute = express.Router()








paymentRoute.post("/upgradePro",UpgradeToPro)
paymentRoute.post("/CaptureOrder",CaptureOrder)



