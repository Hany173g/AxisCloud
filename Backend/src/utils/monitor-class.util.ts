import validator from "validator"
import { AppError } from "./error-handling.util.js"
import { planUser } from "./plans.util.js"
import { Monitor } from "../models/monitor.model.js"
import { createUuid } from "./create-slug.util.js"
import type { IUserDocument } from "../models/user.model.js"
import { Types } from "mongoose"
import type { IMonitorDocument } from "../models/monitor.model.js"
import type { IMonitor } from "../models/monitor.model.js"

export class MonitorHelper {
    private _url: string = ""
    private _method: string = ""
    private _requestTime: number = 5
    private _checkInterval: number = 5
    private _currentMonitors: number = 0
    private _headers: Record<string, string> = {}
    private _name: string = ""

    get url() { return this._url }
    get method() { return this._method; }
    get requestTime() { return this._requestTime; }
    get checkInterval() { return this._checkInterval }
    get headers() { return this._headers }
    get name() { return this._name }

    checkUrl(url: string) {
        if (!validator.isURL(url)) {
            throw new AppError(400, "This is not a URL")
        }
    }

    async checkDuplicateNameMonitor(name: string, userId: Types.ObjectId) {
        if (name) {
            const monitor = await Monitor.findOne({ name, userId })
            if (monitor) throw new AppError(400, "This monitor name is used, please choose another value")
        }
    }

    checkOwnerMonitor(monitorUserId: Types.ObjectId, userId: Types.ObjectId) {
        if (!monitorUserId.equals(userId)) {
            throw new AppError(403, "You not allow to update this monitor");
        }
    }

    async checkCurrentMonitors(id: Types.ObjectId) {
        const limit = await Monitor.find({ userId: id })
        return limit.length
    }

    async checkPlan(userData: IUserDocument) {
        const allowPlans = ["free", "pro", "business"]
        const plan = userData.plan
        if (!allowPlans.includes(plan)) {
            throw new AppError(400, "This plan not allowed")
        }
        const limit: number = await this.checkCurrentMonitors(userData._id)
        this._currentMonitors = limit
        planUser(userData.plan,
            this._method, this._requestTime
            , this._checkInterval, this._currentMonitors
            , this._headers
        )
    }

    async getMonitor(monitorId: string) {
        const monitor = await Monitor.findById(monitorId)
        if (!monitor) throw new AppError(404, "monitor not found")
        return monitor
    }

    checkMethod(method: string) {
        const allowMethods = ["GET", "HEAD", "POST"]
        if (!allowMethods.includes(method)) {
            throw new AppError(400, "This method not allowed")
        }
    }

    checkRequestTimeAndInterval(requestTime: number) {
        if (typeof requestTime !== "number") {
            throw new AppError(400, "The time request not number")
        }
        return Math.floor(requestTime)
    }

    async createMonitor(data: IMonitor): Promise<IMonitorDocument> {
        const newMonitor: IMonitorDocument = await Monitor.create(data)
        if (!newMonitor) {
            throw new AppError(500, "Failed to create monitor")
        }
        return newMonitor
    }

    checkHeadersValue(headers: Record<string, string>) {
        if (headers) {
            for (const key in headers) {
                if (typeof headers[key] != "string") {
                    throw new AppError(400, `value ${key} not allow ${typeof headers[key]}`)
                }
            }
        }
    }

    async updateMonitorData(data: any, monitorId: string) {
        const updateMonitor = await Monitor.findOneAndUpdate({ _id: monitorId }, { $set: data }, { new: true })
        if (!updateMonitor) {
            throw new AppError(500, "Failed to update monitor")
        }
        return updateMonitor
    }

    set url(value: string) {
        this.checkUrl(value)
        this._url = value
    }

    set method(value: string) {
        this.checkMethod(value)
        this._method = value
    }

    set requestTime(value: number) {
        const request = this.checkRequestTimeAndInterval(value)
        this._requestTime = request
    }

    set checkInterval(value: number) {
        const interval = this.checkRequestTimeAndInterval(value)
        this._checkInterval = interval
    }

    set headers(value: Record<string, string>) {
        if (value === undefined || value === null) return
        if (typeof value !== "object" || Array.isArray(value)) {
            throw new AppError(400, "Headers must be an object")
        }
        this.checkHeadersValue(value)
        this._headers = value
    }

    set name(value: string) {
        if (typeof value !== "string" && typeof value !== "number") {
            throw new AppError(400, "This type not allow")
        }
        this._name = value
    }
}
