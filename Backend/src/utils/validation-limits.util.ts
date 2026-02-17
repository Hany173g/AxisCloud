import { LimitUser } from "../models/limit-user.model.js"
import type { ILimitUser } from "../models/limit-user.model.js"
import { Types } from "mongoose"
import { sentAlertLimit } from "../services/send-email.service.js"
import type { IUserDocument } from "../models/user.model.js"

export async function createLimitUser(userId: Types.ObjectId, plan: string) {
    const coolDown = plan == "free" ? 60 : plan == "pro" ? 10 : 5
    const limit = await LimitUser.create({ userId, coolDown, lastAlert: Date.now(), alertCount: 0, limitAlert: false })
    return limit
}

export function isInCoolDown(lastAlert: number) {
    return lastAlert > Date.now()
}

export async function upgradeLimitUser(userId: Types.ObjectId, plan: string) {
    const coolDown = plan == "pro" ? 20 : 10
    const limit = await LimitUser.findOneAndUpdate({ userId }, { $set: { coolDown } })
}

export async function checkLimitAlerts(user: IUserDocument) {
    let isEnabled: boolean = false
    let limit = await LimitUser.findOne({ userId: user._id })
    if (!limit) limit = await createLimitUser(user._id, user.plan)
    if (!isInCoolDown(limit.lastAlert)) {
        await limit.updateOne({ lastAlert: Date.now() + (1000 * 60 * limit.coolDown - 2000) })
        if (user.plan === "free" && limit.limitAlert) {
            if (limit.alertCount >= 3) {
                await sentAlertLimit(user.username, user.email)
                await limit.updateOne({ limitAlert: true })
            }
        } else {
            await limit.updateOne({ alertCount: limit.alertCount + 1 })
            isEnabled = true
        }
    }
    return isEnabled
}

export async function updateUserLimit() {
    await LimitUser.updateMany({}, { $set: { alertCount: 0, limitAlert: false } })
}
