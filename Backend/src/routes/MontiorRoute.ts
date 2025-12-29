
import express, { Router } from "express"
import {CreateMontior} from "../contoller/UpTimeMonitorController.js"


export let montiorRoute = express.Router()











montiorRoute.post("/CreateMontior",CreateMontior)





