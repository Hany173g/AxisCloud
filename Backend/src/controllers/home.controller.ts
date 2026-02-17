import type { Request, Response, NextFunction } from "express"
import { countLogs, getUserData, countMonitors } from "../utils/home.util.js"
import type { RequestUser } from "../types/custom-request.type.js"

export async function getHome(req: Request, res: Response, next: NextFunction) {
    try {
        const reqU = req as RequestUser
        const id = reqU?.user?._id || null
        let userData = null;
        if (id) {
            userData = await getUserData(id)
        }
        const promises = [
            countLogs(),
            countMonitors()
        ]
        const result = await Promise.all(promises)
        res.status(200).json({ websiteData: result, userData })
    } catch (err) {
        next(err)
    }
}
