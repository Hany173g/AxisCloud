
import {Types} from "mongoose"
import {Log} from "../models/LogsMontior.js"
import type {ILogs} from "../models/LogsMontior.js"
import {Montior} from "../models/Montior.js"


















export async function GetLogs(montiorId : Types.ObjectId) : Promise<ILogs[]>  {
    let logs = await Log.find({montiorId})
    return logs
}



export async function UpdateCheckAt() {
    let now = Date.now()
    await Montior.updateMany(
        {},
        {$set:{checkAt:now}}
    )
}