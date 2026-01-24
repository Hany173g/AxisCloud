
import { Log } from "../models/LogsMontior.js";
import { Montior } from "../models/Montior.js";
import { AppError } from "./ErrorHandling.js";
import { CheckIsUser } from "./CheckUser.js";
import { User } from "../models/User.js";
import {Types} from "mongoose"
















export async function CountLogs() {
    let lengthLogs = await Log.countDocuments()
    return lengthLogs
}

export async function CountMontiors() {
    let lengthMontiors = await Montior.countDocuments()
    return lengthMontiors
}


export async function GetUserData(id : Types.ObjectId) {
     let user = await User.findById(id).select("username role plan")
     if (!user) throw new AppError(404,"This account not found")
     return user   
}








