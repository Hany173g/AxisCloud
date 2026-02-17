import type { IMonitorDocument } from "../models/monitor.model.js"
import { WebHook } from "../models/web-hook.model.js"
import type { IWebHook } from "../models/web-hook.model.js"
import type { IUserDocument } from "../models/user.model.js"
import { Types } from "mongoose"
import { AppError } from "./error-handling.util.js"
import fetch from "node-fetch";

import type { HydratedDocument } from "mongoose"

export type WebHookDocument = HydratedDocument<IWebHook>;

export async function sendWebHook(urls: string[], status: string, monitor: IMonitorDocument) {
    const data = {
        content:
            status === "Up"
                ? `✅ **The monitor ${monitor.name} is working perfectly again!**`
                : `🚨 **${monitor.name} is DOWN!**  
            ${process.env.FRONTEND_URL}/monitors/${monitor.slug}`
    };

    const promises = urls.map(url => {
        return fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
    })
    const result = await Promise.allSettled(promises)
}

export async function validationWebHook(monitor: IMonitorDocument, status: string) {
    const webhook: IWebHook | null = await WebHook.findOne({ serviceId: monitor._id })
    if (!webhook) return
    const urls = Object.values(webhook.hooks ?? {});

    await sendWebHook(urls, status, monitor)
}

async function checkLimitHooks(user: IUserDocument, hooks: Record<string, string>) {
    const limitHooks = user.plan == "pro" ? 2 : 5
    const lengthHooks = await WebHook.countDocuments({ userId: user._id })
    if (lengthHooks >= limitHooks || (limitHooks - lengthHooks) < Object.keys(hooks).length) {
        throw new AppError(429, "Webhook limit reached. You can't create more")
    }
}

export async function createWebHook(serviceId: Types.ObjectId, hooks: Record<string, string> | undefined, user: IUserDocument) {
    if (!hooks || Object.keys(hooks).length < 1) return
    if (!["pro", "business"].includes(user.plan)) {
        throw new AppError(403, "Upgrade it to be able to create a webhook")
    }
    const checkHooks = await WebHook.findOne({ serviceId, userId: user._id })
    if (checkHooks) {
        throw new AppError(400, "Webhook already created")
    }
    else {
        await WebHook.create({ serviceId, userId: user._id, hooks })
    }
}

async function checkFindWebHook(serviceId: Types.ObjectId, userId: Types.ObjectId): Promise<WebHookDocument> {
    const webhook = await WebHook.findOne({ serviceId, userId })
    if (!webhook) {
        throw new AppError(404, "This webhook not found")
    }
    return webhook
}

export async function updateField(serviceId: Types.ObjectId, hook: Record<string, string> | undefined, user: IUserDocument) {
    if (!hook || (Object.keys(hook).length > 1 && Object.keys(hook).length < 1)) {
        return
    }
    const webhook = await WebHook.findOne({ serviceId, userId: user._id })
    if (!webhook) {
        await WebHook.create({ serviceId, userId: user._id, hooks: hook })
    }
    else {
        const [key, value] = Object.entries(hook)[0] ?? [];
        if (typeof key !== "string" || typeof value !== "string") return
        webhook.hooks = hook
        webhook.hooks = {
            ...(webhook.hooks ?? {}),
            [key]: value,
        }
        await webhook.save()
    }
}

export async function deleteAllFields(serviceId: Types.ObjectId, userId: Types.ObjectId) {
    const checkHooks = await checkFindWebHook(serviceId, userId)
    await checkHooks.deleteOne()
}

export async function deleteField(serviceId: Types.ObjectId, hookName: string, userId: Types.ObjectId) {
    const checkHooks = await checkFindWebHook(serviceId, userId)
    if (checkHooks.hooks[hookName]) {
        await WebHook.updateOne(
            { serviceId, userId },
            { $unset: { [`hooks.${hookName}`]: "" } }
        );
    } else {
        throw new AppError(404, "This field not find")
    }
}
