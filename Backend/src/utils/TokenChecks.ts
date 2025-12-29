import {Token} from "../models/Token.js"
import  type {TokenType} from "../@types/TokenType.js"


import {hash} from "./HashData.js"


import {AppError} from "./ErrorHandling.js"




const CheckExpiredCode = (value : TokenType )  => {
    let fiveMinutes : number = 1000 * 60 * 5
    let createdTime : number = value.createdAt.getTime() + fiveMinutes
    let now = Date.now()
    if (now  > createdTime)
    {
        throw new AppError(400,"The code has expired")
    }
}



export async function GetCode (token : string)   {

    
    let checkFindDb : TokenType | null = await Token.findOne({token})
    if (!checkFindDb)
    {
        throw new AppError(404,"The code is not found or has expired")
    }
    CheckExpiredCode(checkFindDb)
    return checkFindDb.userId
}