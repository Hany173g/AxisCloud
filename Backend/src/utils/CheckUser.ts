


import {AppError} from "./ErrorHandling.js"




import type {UserTypeWithPlan} from "../@types/CustomUserType.js"








export function CheckIsUser(user :any )
{
    if (!user)
    {
        throw new AppError(401,"You must log in first")
    }
    return user
}