import axios from "axios"
import { Log } from "../models/log.model.js"
import type { ILogDocument, ILog } from "../models/log.model.js"
import type { IMonitor, IMonitorDocument } from "../models/monitor.model.js"
import { Monitor } from "../models/monitor.model.js"
import { AppError } from "./error-handling.util.js"
import { Types } from "mongoose"
import { sentAlertEmail } from "../services/send-email.service.js"
import got from "got"
import type { Method } from "got"
import { checkLimitAlerts } from "./validation-limits.util.js"
import { validationWebHook } from "./web-hooks.util.js"
import { User } from "../models/user.model.js"
import type { IUserDocument } from "../models/user.model.js"

async function getLastLogStatus(monitorId: Types.ObjectId) {
    const lastCheck: ILogDocument | null = await Log.findOne({ monitorId })
        .sort("-createdAt")
    return lastCheck?.status
}

async function checkStatus(monitorStatus: string, statusCheck: string, monitorId: Types.ObjectId) {
    if (monitorStatus != statusCheck) {
        await Monitor.findOneAndUpdate({ _id: monitorId }, { $set: { status: statusCheck } })
    }
}

async function processAlertsAndLogs(monitor: IMonitorDocument, user: IUserDocument, status: string, time: Date): Promise<void> {
    const lastCheck: string | undefined = await getLastLogStatus(monitor._id)
    const lastCheckStatus: string = lastCheck ?? "skip"
    const issue: boolean = status == "Down"

    if (status != lastCheckStatus) {
        const promises = [
            validationWebHook(monitor, status),
            sentAlertEmail(
                user.username,
                status,
                monitor.name,
                time,
                monitor.slug,
                user.email,
                issue
            )
        ]
        await Promise.allSettled(promises)
    }
}

async function catchLogs(err: any, monitor: IMonitorDocument, responseTime: number, user: IUserDocument) {
    let httpStatus: number;
    if (err.code === "ENOTFOUND" || err.code === "EHOSTUNREACH") httpStatus = 503;
    else if (err.code === "ETIMEDOUT") httpStatus = 504;
    else httpStatus = 500;
    const status: string = "Down";
    const log: ILog = {
        monitorId: monitor._id,
        status,
        httpStatus,
        responseTime
    }
    const timeAlert: Date = new Date()
    let createLog: boolean = false
    if (await checkLimitAlerts(user) && monitor.isAlerts) {
        await processAlertsAndLogs(monitor, user, status, timeAlert)
    }
    const lastStatus = await getLastLogStatus(monitor._id)
    if (lastStatus != status) createLog = true
    await checkStatus(monitor.status, status, monitor._id)
    return { log, createLog };
}

function calculateResponseTime(start: number): number {
    return parseFloat(((Date.now() - start) / 1000).toFixed(1));
}

export async function checkUrl(data: IMonitorDocument[]) {
    const allLogs: ILog[] = []
    const requests = data.map(async (monitor) => {
        if (monitor.isActive) {
            const beforeRequest: number = Date.now();
            const user = await User.findById(monitor.userId)
            if (!user) throw new AppError(404, "User Not Found")

            try {
                const timeRequest: Record<string, number> = { request: monitor.requestTime * 1000 }
                const response: any = await got(monitor.url, { timeout: timeRequest, headers: monitor.headers, throwHttpErrors: false, method: monitor.method as Method })
                const responseTime = calculateResponseTime(beforeRequest)
                const status: string = response.statusCode < 400 ? "Up" : "Down"
                let createLog: boolean = false
                if (await checkLimitAlerts(user)) {
                    if (monitor.isAlerts) {
                        const timeAlert: Date = new Date()
                        await processAlertsAndLogs(monitor, user, status, timeAlert)
                    }
                }
                const lastStatus = await getLastLogStatus(monitor._id)
                if (lastStatus != status) createLog = true
                await checkStatus(monitor.status, status, monitor._id)
                if (createLog) {
                    const log = {
                        monitorId: monitor._id,
                        status,
                        httpStatus: response.statusCode,
                        responseTime
                    }
                    allLogs.push(log)
                }
            } catch (err: any) {
                const responseTime = calculateResponseTime(beforeRequest)
                const data = await catchLogs(
                    err,
                    monitor,
                    responseTime,
                    user,
                )
                if (data.createLog) {
                    allLogs.push(data.log)
                }
            }
        }
    })
    await Promise.allSettled(requests)
    const batchSize = 500
    for (let i = 0; i < allLogs.length; i += batchSize) {
        await Log.insertMany(allLogs.slice(i, i + batchSize));
    }
}
