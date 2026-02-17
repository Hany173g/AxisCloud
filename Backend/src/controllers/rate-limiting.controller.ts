import { RateLimiting } from "../models/rate-limiting.model.js";
import type { Request, Response, NextFunction } from "express"
import { checkIsUser } from "../utils/check-user.util.js";
import type { RequestUser } from "../types/custom-request.type.js";
import { createUuid } from "../utils/create-slug.util.js";
import { logValidationAndCreate } from "../utils/rate-limiting.util.js"

export async function createRateLimiting(req: Request, res: Response, next: NextFunction) {
    try {
        const reqU = req as RequestUser
        const user = await checkIsUser(reqU.user)
        const apiKey = createUuid()
        await RateLimiting.create({ userId: user._id, apiKey })
        res.status(201).json()
    } catch (err) {
        next(err)
    }
}

export async function createLog(req: Request, res: Response, next: NextFunction) {
    try {
        const { logs, apiKey } = req.body
    
        await logValidationAndCreate(logs, apiKey)
        res.status(201).json()
    } catch (err: any) {
        next(err)
    }
}
