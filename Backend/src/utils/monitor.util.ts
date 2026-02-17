import { Types } from "mongoose"
import { Log } from "../models/log.model.js"
import type { ILog } from "../models/log.model.js"
import { Monitor } from "../models/monitor.model.js"

export async function getLogs(monitorId: Types.ObjectId): Promise<ILog[]> {
    const logs = await Log.find({ monitorId })
    return logs
}

export async function updateCheckAt() {
    const now = Date.now()
    await Monitor.updateMany(
        {},
        { $set: { checkAt: now } }
    )
}
