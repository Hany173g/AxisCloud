
import express, { Router } from "express"
import {CreateMontior,GetMontiors,GetMontior,UpdateMontior,DeleteAllFeildsWebHook,DeleteFeildWebHook,DeleteMontior} from "../contoller/UpTimeMonitorController.js"


export let montiorRoute = express.Router()











montiorRoute.post("/CreateMontior",CreateMontior)
montiorRoute.get("/GetMontiors",GetMontiors)
montiorRoute.get("/montior/:slug",GetMontior)
montiorRoute.patch("/UpdateMontior/:montiorId",UpdateMontior)
montiorRoute.delete("/DeleteMontior/:montiorId",DeleteMontior)
montiorRoute.delete("/deleteFeildWebHook/:serivceId",DeleteFeildWebHook)
montiorRoute.delete("/deleteAllFeildsWebHook/:serivceId", DeleteAllFeildsWebHook)
