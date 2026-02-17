import { Token } from "../models/token.model.js"
import type { TokenType } from "../types/token.type.js"
import { hash } from "./hash-data.util.js"
import { AppError } from "./error-handling.util.js"

const checkExpiredCode = (value: TokenType) => {
    const fiveMinutes: number = 1000 * 60 * 5
    const createdTime: number = value.createdAt.getTime() + fiveMinutes
    const now = Date.now()
    if (now > createdTime) {
        throw new AppError(400, "The code has expired")
    }
}

export async function getCode(token: string) {
    const checkFindDb: TokenType | null = await Token.findOne({ token })
    if (!checkFindDb) {
        throw new AppError(404, "The code is not found or has expired")
    }
    checkExpiredCode(checkFindDb)
    return checkFindDb.userId
}
