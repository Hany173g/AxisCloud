import { Router } from "express"
import { createMonitor, getMonitors, getMonitor, updateMonitor, deleteAllFieldsWebHook, deleteFieldWebHook, deleteMonitor } from "../controllers/monitor.controller.js"

export const monitorRoute = Router()

monitorRoute.post("/createMonitor", createMonitor)
monitorRoute.get("/getMonitors", getMonitors)
monitorRoute.get("/monitor/:slug", getMonitor)
monitorRoute.patch("/updateMonitor/:monitorId", updateMonitor)
monitorRoute.delete("/deleteMonitor/:monitorId", deleteMonitor)
monitorRoute.delete("/deleteFieldWebHook/:serviceId", deleteFieldWebHook)
monitorRoute.delete("/deleteAllFieldsWebHook/:serviceId", deleteAllFieldsWebHook)
