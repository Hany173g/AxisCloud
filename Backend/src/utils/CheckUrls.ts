import axios from "axios"
import {Log} from "../models/LogsMontior.js"
import type {IDocumentLogs,ILogs} from "../models/LogsMontior.js"
import type {IMontior,IMontiorDocument} from "../models/Montior.js"
import  {Montior} from "../models/Montior.js"
import {AppError} from "./ErrorHandling.js"
import {Types} from "mongoose"
import {sentAlertEmail} from "../services/SendEmail.js"
import got from "got"
import type {Method} from "got"
import { CheckLimitAlerts } from "./ValadtionLimits.js"
import { ValadtionWebHook } from "./WebHooks.js"
import { User } from "../models/User.js"
import type { IUserDocument } from "../models/User.js"



async function GetLastLogStatus(montiorId : Types.ObjectId)  {
        let lastCheck  : IDocumentLogs | null = await Log.findOne({montiorId})
        .sort("-createdAt")
        return lastCheck?.status
    
}

async function CheckStatus(montiorStatus : string , statusCheck : string,montiorId : Types.ObjectId) {
    if (montiorStatus != statusCheck) {
        await Montior.findOneAndUpdate({_id:montiorId},{$set:{status:statusCheck}})
    }
}



async function processAlertsAndLogs(montior : IMontiorDocument , user :  IUserDocument , status : string , time : Date) : Promise<void>{
    
    console.log("in process")
    let lastCheck  : string | undefined = await GetLastLogStatus(montior._id)
    let lastCheckStatus  : string = lastCheck  ?? "skip"
    let issue : boolean  = status == "Down"
    console.log(status != lastCheckStatus , " status " , status ,  " last check status ", lastCheckStatus)
    if (status != lastCheckStatus) {
        console.log("in alerts")
         let promises = [
            ValadtionWebHook(montior,status),
            sentAlertEmail(
                user.username,
                status,
                montior.name,
                time,
                montior.slug,
                user.email,
                issue
            ) 
                ]
        console.log("set alerts")
         await Promise.allSettled(promises)
    }

}



async function CatchLogs(err : any , montior : IMontiorDocument,responseTime : number,user : IUserDocument ,)    {
    let httpStatus: number;
    if(err.code === "ENOTFOUND" || err.code === "EHOSTUNREACH") httpStatus = 503;
    else if(err.code === "ETIMEDOUT") httpStatus = 504;
    else httpStatus = 500;
    const status: string = "Down";
    let log : ILogs = {
        montiorId : montior._id,
        status,
        httpStatus,
        responseTime
    }
    let timeAlert : Date = new Date()
    let createLog : boolean = false
    if (await CheckLimitAlerts(user) && montior.isAlerts) {
           await processAlertsAndLogs(montior,user,status,timeAlert)
    }
     let lastStatus = await GetLastLogStatus(montior._id)  
     if (lastStatus != status) createLog = true
    await  CheckStatus(montior.status , status , montior._id)
    return {log,createLog};
}




function calculateResponseTime(start: number): number {
  return parseFloat(((Date.now() - start) / 1000).toFixed(1));
}

export async function CheckUrl(data: IMontiorDocument[]) {
    
    let allLogs : ILogs[]  = []
    let requests  = data.map(async (montior) => {
     if (montior.isActive) {
        let beforeRequest : number = Date.now();
        let user = await User.findById(montior.userId)
        if (!user) throw new AppError(404,"User Not Found")
        
        try {
            let timeRequest : Record<string,number>  = {request:montior.requestTime * 1000}
            const response : any = await got(montior.url,{timeout:timeRequest,headers:montior.Headers,throwHttpErrors:false,method : montior.method as Method})
            let responseTime = calculateResponseTime(beforeRequest)
            let status : string = response.statusCode  < 400 ? "Up" : "Down"
            let createLog : boolean = false
            if (await CheckLimitAlerts(user)) {
                if (montior.isAlerts) {
                   let timeAlert : Date = new Date()
                   await processAlertsAndLogs(montior,user,status,timeAlert)
                }
            }
            let lastStatus = await GetLastLogStatus(montior._id)  
            if (lastStatus != status) createLog = true
            await  CheckStatus(montior.status , status , montior._id)
            if (createLog) {
                let log = {
                    montiorId:montior._id,
                    status,
                    httpStatus:response.statusCode,
                    responseTime
                }
                allLogs.push(log)
                }
        } catch(err : any)
        {
            console.log(err.code)
            let responseTime = calculateResponseTime(beforeRequest)
            let data = await CatchLogs(
                err,
                montior,
                responseTime,
                user,
            )
            if (data.createLog) {
                 allLogs.push(data.log)
            }
        }
     }   
           
    }) 
    await Promise.allSettled(requests)
    const batchSize = 500
    for (let i = 0; i < allLogs.length; i += batchSize) {
        await Log.insertMany(allLogs.slice(i, i + batchSize));
    }
}
