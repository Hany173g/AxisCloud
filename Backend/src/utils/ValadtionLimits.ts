import { LimitUser } from "../models/LimitUser.js"
import type { ILimitUser } from "../models/LimitUser.js"
import { Types } from "mongoose"
import { sentAlertLimit } from "../services/SendEmail.js"
import type { IUserDocument } from "../models/User.js"











export async function CreateLimitUser(userId : Types.ObjectId,plan : string) {
    let coolDown = plan  == "free" ? 60  : plan == "pro" ? 10 : 5
    let limit = await LimitUser.create({userId,coolDown,lastAlert:Date.now(),alertCount:0,limitAlert:false })
    return limit
} 

export function isInCoolDown( lastAlert : number) {
    return lastAlert > Date.now()
}

export async function UpgradeLimitUser (userId : Types.ObjectId , plan : string) {
    let coolDown = plan  == "pro" ? 20 : 10
    let limit = await LimitUser.findOneAndUpdate({userId},{$set:{coolDown}})
}

export async function CheckLimitAlerts(user : IUserDocument) {
    let isEnabled : boolean = false
    let limit = await LimitUser.findOne({userId:user._id})
    if (!limit) limit = await CreateLimitUser(user._id,user.plan)
    if (!isInCoolDown(limit.lastAlert)) { 
        await limit.updateOne({lastAlert: Date.now() + (1000 * 60 * limit.coolDown - 2000)})
        if (user.plan === "free" &&  limit.limitAlert) {
            if (limit.alertCount >= 3) {
                await sentAlertLimit(user.username,user.email)
                await limit.updateOne({limitAlert:true})
            }
        } else {
            await limit.updateOne({alertCount: limit.alertCount + 1})
            isEnabled = true
        }
    }
    return isEnabled
}



export async function UpdateUserLimit() {
    await LimitUser.updateMany({},{$set:{alertCount:0,limitAlert:false}})
}