
import { RateLimting } from "../models/RateLimting.js";
import type {Request,Response,NextFunction} from "express"
import { CheckIsUser } from "../utils/CheckUser.js";
import type { RequestUser } from "../@types/CustomRequest.js";
import { CreateUuid } from "../utils/CreateSlug.js";
import {LogValdationAndCreate} from "../utils/RateLimting.js"



export async function CreateRateLimting(req : Request,res : Response, next : NextFunction) {
    try{
        let reqU = req as RequestUser
        let user = await CheckIsUser(reqU.user)
        let apiKey = CreateUuid()
        await RateLimting.create({userId:user._id,apiKey})
        res.status(201).json()
    }catch(err) {
        next(err)
    }
}



export async function CreateLog(req : Request , res : Response , next : NextFunction) {
    try{
        const {logs,apiKey} = req.body
        console.log(apiKey)
        console.log(logs)
        await LogValdationAndCreate(logs,apiKey)
        res.status(201).json()
    }catch(err : any)  {
        next (err)
    }
}