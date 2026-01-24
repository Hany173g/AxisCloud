
import type { IMontiorDocument } from "../models/Montior.js"
import { WebHook } from "../models/WeebHooks.js"
import  type{ IWebHook } from "../models/WeebHooks.js"
import type { IUserDocument } from "../models/User.js"
import {Types} from "mongoose"
import { AppError } from "./ErrorHandling.js"
import fetch from "node-fetch";

import type { HydratedDocument } from "mongoose"

export type WebHookDocument = HydratedDocument<IWebHook>;



export async function SendWebHook(urls : string[],status : string,montior : IMontiorDocument) {
    let data = {
    content:
    status === "up"
                ? `✅ **The monitor ${montior.name} is working perfectly again!**`
                : `🚨 **${montior.name} is DOWN!**  
            ${process.env.FRONTEND_URL}/monitors/${montior.slug}`
         };

    let promises = urls.map(url => {
        return  fetch(url , {
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    })
    let result = await Promise.allSettled(promises)
    
}






export async function ValadtionWebHook(montior  : IMontiorDocument, status : string ) {
    let webhook : IWebHook | null= await WebHook.findOne({serivceId:montior._id})
    if (!webhook) return
    const urls = Object.values(webhook.hooks ?? {});

    await SendWebHook(urls , status,montior)
}




async function CheckLimitHooks(user  : IUserDocument , hooks : Record<string,string>) {

    let limitHooks = user.plan == "pro" ? 2 : 5
    let lengthHooks = await WebHook.countDocuments({ userId: user._id })
    if (lengthHooks >= limitHooks || (limitHooks - lengthHooks) < Object.keys(hooks).length) {
        throw new AppError(429,"Webhook limit reached. You can't create more")
    }
  
}


export async function CreateWebHook(serivceId : Types.ObjectId , hooks : Record<string,string> | undefined,user : IUserDocument) {
    if (!hooks || Object.keys(hooks).length < 1) return
    if (!["pro","business"].includes(user.plan)) {
        throw new AppError(403,"Upgrade it to be able to create a webhook")
    }
    let checkHooks = await WebHook.findOne({serivceId,userId:user._id})
    if (checkHooks) {
       throw new AppError(400, "Webhook already created")
    }
    else {
        await WebHook.create({serivceId,userId:user._id,hooks})
    }
}



async function CheckFindWebHook(serivceId : Types.ObjectId, userId: Types.ObjectId) : Promise<WebHookDocument> {
    let webhook = await WebHook.findOne({serivceId,userId})
    if (!webhook) {
        throw new AppError(404,"This webhook not found")
    }
    return webhook
} 







export async function UpdateFeild(serivceId : Types.ObjectId , hook : Record<string,string> | undefined,user : IUserDocument,) {
    if (!hook || (Object.keys(hook).length > 1 && Object.keys(hook).length < 1)){
        return
    } 
    let webhook = await WebHook.findOne({serivceId,userId:user._id})
    if (!webhook) {
        await WebHook.create({serivceId,userId:user._id,hooks:hook})
    }
    else {
    const [key, value] = Object.entries(hook)[0] ?? [];
    if (typeof key !== "string" || typeof value !== "string") return
    webhook.hooks = hook
    webhook.hooks = {
    ...(webhook.hooks ?? {}),
    [key]: value,
}

    await webhook.save()  
    }
}


export async function DeleteAllFeilds(serivceId : Types.ObjectId, userId: Types.ObjectId ) {
  
     let checkHooks = await CheckFindWebHook(serivceId, userId)
     await checkHooks.deleteOne()
}


export async function DeleteFeild(serivceId : Types.ObjectId , hookName : string, userId: Types.ObjectId) {
    let checkHooks = await CheckFindWebHook(serivceId, userId)
    if (checkHooks.hooks[hookName]) {
  
        await WebHook.updateOne(
            { serivceId, userId },
            { $unset: { [`hooks.${hookName}`]: "" } }
            );  
    } else {
        throw new AppError(404,"This feild not find")
    }
     
}

