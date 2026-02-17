import { AppError } from "./error-handling.util.js"

export interface Plans {
    method: string[],
    requestTime: number,
    checkInterval: number
    maxMonitors: number
    allowHeaders: string[]
}

function checkPlans(method: string,
    tMethod: string[],
    requestTime: number,
    tRequestTime: number, checkInterval: number,
    tCheckInterval: number, currentMonitors: number,
    tMaxMonitors: number) {
    method = method ?? tMethod[0];
    requestTime = requestTime ?? tRequestTime;
    checkInterval = checkInterval ?? tCheckInterval;
    if (currentMonitors >= tMaxMonitors) {
        throw new AppError(429, "You have reached your maximum limit")
    }
    else if (!tMethod.includes(method)) {
        throw new AppError(400, "The method is incorrect")
    }
    else if (Math.floor(requestTime) > tRequestTime) {
        throw new AppError(400, "The request time is incorrect")
    }
    else if (Math.floor(checkInterval) < tCheckInterval) {
        throw new AppError(400, "The check interval is incorrect")
    }
}

function checkAllowHeaders(allowHeaders: string[], headersRequest: Record<string, string>) {
    for (const key in headersRequest) {
        if (!allowHeaders.includes(key)) {
            throw new AppError(400, `This ${key} not allow`)
        }
    }
}

function checkSizeHeaders(headersRequest: Record<string, string>) {
    if (headersRequest) {
        let totalSize = 0;
        const INVALID_HEADER_VALUE_REGEX = /[\x00-\x1F\x7F]/;
        for (const [key, value] of Object.entries(headersRequest)) {
            totalSize += Buffer.byteLength(key, "utf8");
            totalSize += Buffer.byteLength(value, "utf8");
            if (INVALID_HEADER_VALUE_REGEX.test(value)) {
                throw new AppError(400, "Invalid characters in header value");
            }
        }
        if (totalSize > 8 * 1024) {
            throw new AppError(413, "Headers too large");
        }
    }
}

export class FreePlan implements Plans {
    method: string[] = ["GET", "HEAD"]
    requestTime: number = 5
    checkInterval: number = 10
    maxMonitors: number = 5
    allowHeaders: string[] = ["Accept", "Accept-Language"]
    constructor(method: string,
        requestTime: number,
        checkInterval: number,
        maxMonitors: number,
        headersRequest: Record<string, string>) {
        checkPlans(method, this.method, requestTime, this.requestTime, checkInterval, this.checkInterval, maxMonitors, this.maxMonitors)
        checkAllowHeaders(this.allowHeaders, headersRequest)
        checkSizeHeaders(headersRequest)
    }
}

export class ProPlan implements Plans {
    method: string[] = ["GET", "HEAD"]
    requestTime: number = 10
    checkInterval: number = 3
    maxMonitors: number = 30
    allowHeaders: string[] = ["Accept", "Accept-Language", "User-Agent", "Authorization", "Cache-Control"]
    constructor(method: string,
        requestTime: number,
        checkInterval: number,
        maxMonitors: number,
        headersRequest: Record<string, string>) {
        checkPlans(method, this.method, requestTime, this.requestTime, checkInterval, this.checkInterval, maxMonitors, this.maxMonitors)
        checkAllowHeaders(this.allowHeaders, headersRequest)
        checkSizeHeaders(headersRequest)
    }
}

export class BusinessPlan implements Plans {
    method: string[] = ["GET", "HEAD", "POST"]
    requestTime: number = 15
    checkInterval: number = 1
    maxMonitors: number = 100
    allowHeaders: string[] = ["Accept", "Accept-Language", "User-Agent", "Authorization", "Cache-Control", "Origin", "I-KEY", "Accept-Encoding", "Accept-Encodin", "Accept-Charset"]
    constructor(method: string,
        requestTime: number,
        checkInterval: number,
        maxMonitors: number,
        headersRequest: Record<string, string>) {
        checkPlans(method, this.method, requestTime, this.requestTime, checkInterval, this.checkInterval, maxMonitors, this.maxMonitors)
        checkAllowHeaders(this.allowHeaders, headersRequest)
        checkSizeHeaders(headersRequest)
    }
}

export function planUser(plan: string, method: string, requestTime: number, checkInterval: number, currentMonitors: number, headers: Record<string, string>) {
    const PlanClass =
        plan === "free" ? FreePlan : plan == "pro" ? ProPlan : BusinessPlan;
    new PlanClass(method, requestTime, checkInterval, currentMonitors, headers);
}
