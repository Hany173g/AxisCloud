
import { AppError } from "./ErrorHandling.js";
import { RateLimting } from "../models/RateLimting.js";
import validator from "validator"
import {RateLimitLog} from "../models/RateLimitLogs.js"
 async function GetRateLimting(apiKey : string) {
    let findApiKey = await RateLimting.findOne({apiKey})
    if (!findApiKey) {
        throw new AppError(404, "this api key not found")
    }
    return findApiKey
}


export interface LogSchema {
    userAgent : string,
    ip : string,
    path : string,
    country ?: string
    apiKey : string
}





  function CheckStringData (data : string[]) {
    for (let i = 0; i < data.length ;i++) {
        if (typeof data[i] != "string") {
            throw new AppError(400, "Data is incorrect")
        }
    }
}
  function CheckIp(ip : string) {
    if (!validator.isIP(ip)) {
        throw new AppError(400,"This not ip")
    }
}



export async function LogValdationAndCreate(logs : LogSchema[] , apiKey : string) {
    if (logs.length >= 30 && logs.length < 31) throw new AppError(400,"Don't meddle with what doesn't concern you")
    await GetRateLimting(apiKey)
    for (let i = 0 ; i < logs.length ; i++) {
        logs[i]!.apiKey = apiKey
        let [userAgent , ip  , path,country] = [logs[i]?.userAgent ?? "",logs[i]?.ip ?? "" , logs[i]?.path ?? "",logs[i]?.country ?? ""]
        CheckStringData([userAgent , ip  , path,country])
        CheckIp(ip)
    }
    await RateLimitLog.insertMany(logs)
}



