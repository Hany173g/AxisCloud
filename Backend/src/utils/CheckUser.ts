


import {AppError} from "./ErrorHandling.js"
import {User} from "../models/User.js"


import type {UserTypeWithPlan} from "../@types/CustomUserType.js"








export async function CheckIsUser(user :any )
{
    if (!user)
    {
        throw new AppError(401,"You must log in first")
    }
    let checkUser = await User.findById(user._id)
    if (!checkUser) throw new AppError(404,"You account not found")
    return user
}