import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"
import type { RequestUser } from "../types/custom-request.type.js"
import { AppError } from "../utils/error-handling.util.js"
import type { UserType } from "../types/custom-user-type.type.js"

export function checkToken(req: Request, res: Response, next: NextFunction) {
    try {
        const reqUser = req as RequestUser
        const header: string | undefined = req.headers["authorization"]
        if (!header || !header.startsWith("Bearer")) {
            reqUser.user = null
            return next()
        }

        const token = header?.split(" ")[1]
        if (!token) {
            reqUser.user = null
            return next()
        }
        const JWT_ACCESS = process.env.JWT_ACCESS
        if (!JWT_ACCESS) {
            reqUser.user = null
            return next()
        }

        const decoded: any = jwt.verify(token, JWT_ACCESS);
        reqUser.user = decoded

        next()
    } catch (err: any) {
        const reqUser = req as RequestUser
        reqUser.user = null
        next()
    }
}
