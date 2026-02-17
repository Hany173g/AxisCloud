import { AppError } from "./error-handling.util.js"
import { User } from "../models/user.model.js"
import type { IUserDocument } from "../models/user.model.js"

export async function checkIsUser(user: any): Promise<IUserDocument> {
    if (!user) {
        throw new AppError(401, "You must log in first")
    }
    const checkUser: IUserDocument | null = await User.findById(user._id)
    if (!checkUser) throw new AppError(404, "You account not found")
    return checkUser
}
