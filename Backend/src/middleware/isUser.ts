
import jwt from "jsonwebtoken"


import type {Request,Response,NextFunction} from "express"
import type {RequestUser} from "../@types/CustomRequest.js"
import {AppError} from "../utils/ErrorHandling.js"
import type {UserType} from "../@types/CustomUserType.js"


export function CheckToken(req : Request , res: Response,next: NextFunction)
{
    try{
        let reqUser = req as RequestUser
        let header : string | undefined = req.headers["authorization"]
        if (!header || !header.startsWith("Bearer"))
        {
           reqUser.user = null
           return next()
        }

        let token = header?.split(" ")[1]
        if (!token)
        {
            reqUser.user = null
            return next()
        }
        let JWT_ACCESS = process.env.JWT_ACCESS
        if (!JWT_ACCESS){
             reqUser.user = null
             return next()
        } 
           
        const decoded  : any = jwt.verify(token, JWT_ACCESS);
        reqUser.user = decoded
        
        next()
    }catch(err : any)
    {
        let reqUser = req as RequestUser
        console.log(err.message)
        reqUser.user = null
        next()
    }
}