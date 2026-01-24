


import type {Request,Response,NextFunction} from "express"
import {AppError} from "../utils/ErrorHandling.js"
import { CreateUuid } from "../utils/CreateSlug.js"
import {MontiorHelper} from "../utils/MontiorClass.js"
import type {RequestUser} from "../@types/CustomRequest.js"
import {CheckIsUser} from "../utils/CheckUser.js"
import { updateMontiorSchema,ZodValadtion ,deleteFeildSchema} from "../utils/Zod.js"
import {Log} from "../models/LogsMontior.js"
import { Montior } from "../models/Montior.js"
import type { IMontior } from "../models/Montior.js"
import type {ILogs} from "../models/LogsMontior.js"
import {PlanUser} from "../utils/Plans.js"
import {ApiFeatures} from "../utils/ApiFeatures.js"
import {Types} from "mongoose"
import { WebHook } from "../models/WeebHooks.js"
import {CreateWebHook,UpdateFeild,DeleteFeild,DeleteAllFeilds} from "../utils/WebHooks.js"
export async function CreateMontior(req : Request,res: Response, next : NextFunction)
{
    try{
        let reqU = req as RequestUser
        let user = await CheckIsUser(reqU?.user)
        const {url,method,requestTime,checkInterval,headers ,name,hooks } = req.body
        let newMontior = new MontiorHelper()
        await newMontior.CheckDuplicateNameMontior(name , user._id)
        let id = user._id.toString()
        newMontior.url = url
        newMontior.method = method
        newMontior.requestTime = requestTime
        newMontior.checkInterval = checkInterval
        newMontior.headers = headers
        newMontior.name = name
        await  newMontior.CheckPlan(user)
        newMontior.CheckHeadersValue(newMontior.headers)
        let slug = CreateUuid()
        let checkAt : number  = Date.now()
        let data : IMontior  = {
            url: newMontior.url, 
            userId: user._id,
            checkAt,
            method: newMontior.method,
            requestTime: newMontior.requestTime,
            checkInterval: newMontior.checkInterval,
            Headers: newMontior.headers,
            name: newMontior.name,
            isActive: true,
            status:"up",
            plan: user.plan,
            slug: slug,
            isAlerts:true
        }
        let montior =  await newMontior.CreateMontior(data)
        await CreateWebHook(montior._id,hooks ,user)
        res.status(200).json(newMontior)
    }catch(err)
    {
        next(err)
    }
}





export async function GetMontiors(req : Request,res: Response, next : NextFunction) {
    try{
         let reqU = req as RequestUser
         let user = await CheckIsUser(reqU?.user)
         let userId = user._id
         let newApiFeatures = new ApiFeatures(Montior.find({userId}),req.query).sort().loadNextChunk()
         let montiors = await newApiFeatures.query;
         res.status(200).json({montiors})           
    }catch(err)
    {
        next(err)
    }
}


export async function GetMontior(req : Request,res: Response, next : NextFunction) {
    try{
            
         let reqU = req as RequestUser
         let {slug} = req.params
         if (!slug || typeof slug != "string") throw new AppError(400,"The data is incorrect")
         let user = await CheckIsUser(reqU?.user)
         let userId = user._id    
         let montior = await Montior.findOne({slug,userId})
         if (!montior) throw new AppError(404,"This montior not found")
         let webHook = await WebHook.findOne({serivceId:montior._id}).select("hooks")   
         let newApiFeatures = new ApiFeatures(Log.find({montiorId: montior._id}),req.query).sort().loadNextChunk()
         let logs : ILogs[] = await newApiFeatures.query
         res.status(200).json({montior,logs,webHook})   
    }catch(err)
    {
        next(err)
    }
}



export async function UpdateMontior(req : Request , res : Response , next : NextFunction) {
    try{
        let result = updateMontiorSchema.safeParse(req.body)
        const { montiorId } = req.params;
        const montiorIdStr = Array.isArray(montiorId) ? montiorId[0] : montiorId;
        let data = ZodValadtion(result)
        let reqU = req as RequestUser
        let user = await CheckIsUser(reqU?.user)
        let newMontior = new MontiorHelper()
        await newMontior.CheckDuplicateNameMontior(data.name , user._id)
        if (!montiorIdStr) throw new AppError(404,"montior id not found")
        let montior = await newMontior.GetMontior(montiorIdStr)
        newMontior.CheckOwnerMontior(
        montior.userId,
        user._id)
        newMontior.CheckHeadersValue(data.headers)
        PlanUser(user.plan , data.method,data.requestTime,data.checkInterval,0,data.headers)
        let updateMontior = await newMontior.UpdateMontiorData(data,montiorIdStr)
        await UpdateFeild(updateMontior?._id,data.hooks,user)
        res.status(200).json({updateMontior})
    }catch(err) {
        next(err)
    }
}




export async function DeleteMontior(req : Request ,res : Response , next : NextFunction) {
    try{
        let reqU = req as RequestUser
        let user = await CheckIsUser(reqU?.user)
        const {montiorId} = req.params
        if (typeof montiorId != "string") throw new AppError(404, "montiorId must be string")
        let newMontior = new MontiorHelper()    
        let montior = await newMontior.GetMontior(montiorId)
        newMontior.CheckOwnerMontior(
        montior.userId,
        user._id
    )
      await Montior.deleteOne({_id:montiorId})
      res.status(201).json()
    } catch(err) {
        next(err)
    }
}

export async function DeleteFeildWebHook(req : Request , res : Response , next : NextFunction) {
    try{
        let reqU = req as RequestUser
        let user = await CheckIsUser(reqU?.user)
        let result = deleteFeildSchema.safeParse(req.body)
        let data = ZodValadtion(result)
        let {serivceId} = req.params
        const serivceIdStr = Array.isArray(serivceId) ? serivceId[0] : serivceId;
        if (!serivceIdStr) throw new AppError(404,"montior id not found")
        const id = new Types.ObjectId(serivceIdStr);
    
        await DeleteFeild(id,data.hookName,user._id)
        res.status(201).json()
    } catch(err) {
        next(err)
    }
}


export async function DeleteAllFeildsWebHook(req : Request , res : Response, next : NextFunction) {
    try{
        let reqU = req as RequestUser
        let user = await CheckIsUser(reqU?.user)
        let {serivceId} = req.params
        const serivceIdStr = Array.isArray(serivceId) ? serivceId[0] : serivceId;
        if (!serivceIdStr) throw new AppError(404,"montior id not found")
        const id = new Types.ObjectId(serivceIdStr);
        let newMontior = new MontiorHelper()
        let montior = await newMontior.GetMontior(serivceIdStr)
        newMontior.CheckOwnerMontior(
        montior.userId,
        user._id
        )
        await DeleteAllFeilds(id,user._id)
        res.status(201).json()
    } catch(err) {
        next(err)
    }
}


