import { AppError } from "./error-handling.util.js";
import { RateLimiting } from "../models/rate-limiting.model.js";
import validator from "validator"
import { RateLimitLog } from "../models/rate-limit-log.model.js"

async function getRateLimiting(apiKey: string) {
    const findApiKey = await RateLimiting.findOne({ apiKey })
    if (!findApiKey) {
        throw new AppError(404, "this api key not found")
    }
    return findApiKey
}

export interface LogSchema {
    userAgent: string,
    ip: string,
    path: string,
    country?: string
    apiKey: string
}

function checkStringData(data: string[]) {
    for (let i = 0; i < data.length; i++) {
        if (typeof data[i] != "string") {
            throw new AppError(400, "Data is incorrect")
        }
    }
}

function checkIp(ip: string) {
    if (!validator.isIP(ip)) {
        throw new AppError(400, "This not ip")
    }
}

export async function logValidationAndCreate(logs: LogSchema[], apiKey: string) {
    if (logs.length >= 30 && logs.length < 31) throw new AppError(400, "Don't meddle with what doesn't concern you")
    await getRateLimiting(apiKey)
    for (let i = 0; i < logs.length; i++) {
        logs[i]!.apiKey = apiKey
        const [userAgent, ip, path, country] = [logs[i]?.userAgent ?? "", logs[i]?.ip ?? "", logs[i]?.path ?? "", logs[i]?.country ?? ""]
        checkStringData([userAgent, ip, path, country])
        checkIp(ip)
    }
    await RateLimitLog.insertMany(logs)
}
