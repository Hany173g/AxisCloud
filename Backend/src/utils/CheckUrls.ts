import axios from "axios"
import {Log} from "../models/LogsMontior.js"
import type {ILogs} from "../models/LogsMontior.js"
import type {IMontior} from "../models/Montior.js"
import {AppError} from "./ErrorHandling.js"
import { resolve, TIMEOUT } from "node:dns"
import type { Types } from "mysql2"


import got from "got"






export async function CheckUrl(data: IMontior[]) {
    try{   console.log(data) 
    let allLogs : ILogs[]  = []
    let requests  = data.map(async (d) => {
            let beforeRequest = Date.now()
            let timeRequest : Record<string,number>  = {request:d.requestTime * 1000}
            const response : any = await got(d.url,{timeout:timeRequest,headers:d.Headers,throwHttpErrors:false})
          
            let afterRequest = Date.now()
            let time = (afterRequest - beforeRequest ) / 1000
            let responseTime = parseFloat(time.toFixed(1))
            let status : string = response.statusCode  < 400 ? "Up" : "Down"
            let id = d._id
            if (!id) throw new AppError(400,"Id Missing")
           let log = {
            montiorId:id 
            ,status,
            httpStatus:response.statusCode,
            responseTime}
            allLogs.push(log)
    }) 

    await Promise.allSettled(requests)
    console.log(allLogs)
    await Log.insertMany(allLogs)
    }catch(err : any)
    {
        console.log(err.message)
    }
  
}