import { Log } from "../models/log.model.js";
import { Monitor } from "../models/monitor.model.js";
import { AppError } from "./error-handling.util.js";
import { checkIsUser } from "./check-user.util.js";
import { User } from "../models/user.model.js";
import { Types } from "mongoose"

export async function countLogs() {
    const lengthLogs = await Log.countDocuments()
    return lengthLogs
}

export async function countMonitors() {
    const lengthMonitors = await Monitor.countDocuments()
    return lengthMonitors
}

export async function getUserData(id: Types.ObjectId) {
    const user = await User.findById(id).select("username role plan")
    if (!user) throw new AppError(404, "This account not found")
    return user
}
