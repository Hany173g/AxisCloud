import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/error-handling.util.js"
import { createUuid } from "../utils/create-slug.util.js"
import { MonitorHelper } from "../utils/monitor-class.util.js"
import type { RequestUser } from "../types/custom-request.type.js"
import { checkIsUser } from "../utils/check-user.util.js"
import { updateMonitorSchema, zodValidation, deleteFieldSchema } from "../utils/zod.util.js"
import { Log } from "../models/log.model.js"
import { Monitor } from "../models/monitor.model.js"
import type { IMonitor } from "../models/monitor.model.js"
import type { ILog } from "../models/log.model.js"
import { planUser } from "../utils/plans.util.js"
import { ApiFeatures } from "../utils/api-features.util.js"
import { Types } from "mongoose"
import { WebHook } from "../models/web-hook.model.js"
import { createWebHook, updateField, deleteField, deleteAllFields } from "../utils/web-hooks.util.js"

export async function createMonitor(req: Request, res: Response, next: NextFunction) {
    try {
        const reqU = req as RequestUser
        const user = await checkIsUser(reqU?.user)
        const { url, method, requestTime, checkInterval, headers, name, hooks } = req.body
        const newMonitor = new MonitorHelper()
        await newMonitor.checkDuplicateNameMonitor(name, user._id)
        newMonitor.url = url
        newMonitor.method = method
        newMonitor.requestTime = requestTime
        newMonitor.checkInterval = checkInterval
        newMonitor.headers = headers
        newMonitor.name = name
        await newMonitor.checkPlan(user)
        newMonitor.checkHeadersValue(newMonitor.headers)
        const slug = createUuid()
        const checkAt: number = Date.now()
        const data: IMonitor = {
            url: newMonitor.url,
            userId: user._id,
            checkAt,
            method: newMonitor.method,
            requestTime: newMonitor.requestTime,
            checkInterval: newMonitor.checkInterval,
            headers: newMonitor.headers,
            name: newMonitor.name,
            isActive: true,
            status: "up",
            plan: user.plan,
            slug: slug,
            isAlerts: true
        }
        const monitor = await newMonitor.createMonitor(data)
        await createWebHook(monitor._id, hooks, user)
        res.status(200).json(newMonitor)
    } catch (err) {
        next(err)
    }
}

export async function getMonitors(req: Request, res: Response, next: NextFunction) {
    try {
        const reqU = req as RequestUser
        const user = await checkIsUser(reqU?.user)
        const userId = user._id
        const newApiFeatures = new ApiFeatures(Monitor.find({ userId }), req.query).sort().loadNextChunk()
        const monitors = await newApiFeatures.query;
        res.status(200).json({ monitors })
    } catch (err) {
        next(err)
    }
}

export async function getMonitor(req: Request, res: Response, next: NextFunction) {
    try {
        const reqU = req as RequestUser
        const { slug } = req.params
        if (!slug || typeof slug != "string") throw new AppError(400, "The data is incorrect")
        const user = await checkIsUser(reqU?.user)
        const userId = user._id
        const monitor = await Monitor.findOne({ slug, userId })
        if (!monitor) throw new AppError(404, "This monitor not found")
        const webHook = await WebHook.findOne({ serviceId: monitor._id }).select("hooks")
        const newApiFeatures = new ApiFeatures(Log.find({ monitorId: monitor._id }), req.query).sort().loadNextChunk()
        const logs: ILog[] = await newApiFeatures.query
        res.status(200).json({ monitor, logs, webHook })
    } catch (err) {
        next(err)
    }
}

export async function updateMonitor(req: Request, res: Response, next: NextFunction) {
    try {
        const result = updateMonitorSchema.safeParse(req.body)
        const { monitorId } = req.params;
        const monitorIdStr = Array.isArray(monitorId) ? monitorId[0] : monitorId;
        const data = zodValidation(result)
        const reqU = req as RequestUser
        const user = await checkIsUser(reqU?.user)
        const newMonitor = new MonitorHelper()
        await newMonitor.checkDuplicateNameMonitor(data.name, user._id)
        if (!monitorIdStr) throw new AppError(404, "monitor id not found")
        const monitor = await newMonitor.getMonitor(monitorIdStr)
        newMonitor.checkOwnerMonitor(
            monitor.userId,
            user._id)
        newMonitor.checkHeadersValue(data.headers)
        planUser(user.plan, data.method, data.requestTime, data.checkInterval, 0, data.headers)
        const updateMonitor = await newMonitor.updateMonitorData(data, monitorIdStr)
        await updateField(updateMonitor?._id, data.hooks, user)
        res.status(200).json({ updateMonitor })
    } catch (err) {
        next(err)
    }
}

export async function deleteMonitor(req: Request, res: Response, next: NextFunction) {
    try {
        const reqU = req as RequestUser
        const user = await checkIsUser(reqU?.user)
        const { monitorId } = req.params
        if (typeof monitorId != "string") throw new AppError(404, "monitorId must be string")
        const newMonitor = new MonitorHelper()
        const monitor = await newMonitor.getMonitor(monitorId)
        newMonitor.checkOwnerMonitor(
            monitor.userId,
            user._id
        )
        await Monitor.deleteOne({ _id: monitorId })
        res.status(201).json()
    } catch (err) {
        next(err)
    }
}

export async function deleteFieldWebHook(req: Request, res: Response, next: NextFunction) {
    try {
        const reqU = req as RequestUser
        const user = await checkIsUser(reqU?.user)
        const result = deleteFieldSchema.safeParse(req.body)
        const data = zodValidation(result)
        const { serviceId } = req.params
        const serviceIdStr = Array.isArray(serviceId) ? serviceId[0] : serviceId;
        if (!serviceIdStr) throw new AppError(404, "monitor id not found")
        const id = new Types.ObjectId(serviceIdStr);

        await deleteField(id, data.hookName, user._id)
        res.status(201).json()
    } catch (err) {
        next(err)
    }
}

export async function deleteAllFieldsWebHook(req: Request, res: Response, next: NextFunction) {
    try {
        const reqU = req as RequestUser
        const user = await checkIsUser(reqU?.user)
        const { serviceId } = req.params
        const serviceIdStr = Array.isArray(serviceId) ? serviceId[0] : serviceId;
        if (!serviceIdStr) throw new AppError(404, "monitor id not found")
        const id = new Types.ObjectId(serviceIdStr);
        const newMonitor = new MonitorHelper()
        const monitor = await newMonitor.getMonitor(serviceIdStr)
        newMonitor.checkOwnerMonitor(
            monitor.userId,
            user._id
        )
        await deleteAllFields(id, user._id)
        res.status(201).json()
    } catch (err) {
        next(err)
    }
}
