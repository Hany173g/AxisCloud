

import {AppError} from "./ErrorHandling.js"




export interface Plans {
     method : string[],
    requestTime : number,
    checkInterval : number
    maxMontiors : number
    allowHeaders: string[]
}




function CheckPlans (method : string , 
    T_method : string[] ,
    requestTime : number , 
    T_requestTime  : number,checkInterval : number ,
    T_checkInterval : number,currentMontiors : number ,
    T_maxMontiors: number)
{
    method = method ?? T_method[0] ;
    requestTime = requestTime ?? T_requestTime ;
    checkInterval = checkInterval ?? T_checkInterval ;
     if (currentMontiors >= T_maxMontiors)
        {
            throw new AppError(429,"You have reached your maximum limit")
        }
       if (!T_method.includes(method) || Math.floor(requestTime) > T_requestTime ||  Math.floor(checkInterval) < T_checkInterval )
        {
           
            throw new AppError(400,"The data is incorrect")
        }
}


function CheckAllowHeaders(allowHeaders : string[],headersRequest : Record<string,string>)
{
    for (let key in headersRequest)
    {       
        if (!allowHeaders.includes(key))
        {
            throw new AppError(400,`This ${key} not allow`)
        }
        
    }
}

function CheckSizeHeaders(headersRequest : Record<string,string>)
{
    if (headersRequest) {
          let totalSize = 0;
    const INVALID_HEADER_VALUE_REGEX = /[\x00-\x1F\x7F]/;
    for (const [key, value] of Object.entries(headersRequest)) {
        totalSize += Buffer.byteLength(key, "utf8");
         totalSize += Buffer.byteLength(value, "utf8");
        if (INVALID_HEADER_VALUE_REGEX.test(value)) {
            throw new AppError(400, "Invalid characters in header value");
           }
        }
        if (totalSize > 8 * 1024) {
            throw new AppError(413, "Headers too large");
        }
    }    
}


export class FreePlan implements Plans {
     method : string[] = ["GET","HEAD"]
     requestTime : number = 5
     checkInterval : number = 10
     maxMontiors : number = 5
     allowHeaders: string[] = ["Accept","Accept-Language"]
    constructor( method : string,
         requestTime:number,
         checkInterval: number,
         maxMontiors : number,
         headersRequest : Record<string,string>)
    {
        CheckPlans(method,this.method,requestTime,this.requestTime,checkInterval,this.checkInterval,maxMontiors,this.maxMontiors)
        CheckAllowHeaders(this.allowHeaders,headersRequest)
        CheckSizeHeaders(headersRequest)
    }   
   
}





export class ProPlan implements Plans {
    method : string[] = ["GET","HEAD"]
    requestTime : number = 10
    checkInterval : number = 3
    maxMontiors : number = 30
    allowHeaders: string[] = ["Accept","Accept-Language","User-Agent","Authorization","Cache-Control"]
     constructor( method : string,
         requestTime:number,
         checkInterval: number,
         maxMontiors : number,
         headersRequest : Record<string,string>)
    {
       CheckPlans(method,this.method,requestTime,this.requestTime,checkInterval,this.checkInterval,maxMontiors,this.maxMontiors)
        CheckAllowHeaders(this.allowHeaders,headersRequest)
        CheckSizeHeaders(headersRequest)
        
    }   
}



export class BusinessPlan implements Plans {
    method : string[] = ["GET","HEAD","POST"]
    requestTime : number = 15
    checkInterval : number = 1
     maxMontiors : number = 100
     allowHeaders: string[] = ["Accept","Accept-Language","User-Agent","Authorization","Cache-Control","Origin","I-KEY","Accept-Encoding","Accept-Encodin","Accept-Charset"]
     constructor( method : string,
         requestTime:number,
         checkInterval: number ,
         maxMontiors : number,
         headersRequest : Record<string,string>)
    {
        CheckPlans(method,this.method,requestTime,this.requestTime,checkInterval,this.checkInterval,maxMontiors,this.maxMontiors)
        CheckAllowHeaders(this.allowHeaders,headersRequest)
        CheckSizeHeaders(headersRequest)
    }   
}



export function PlanUser(plan : string,method : string,requestTime : number,checkInterval : number,currentMontiors : number,headers : Record<string,string>)  {
  let PlanClass =
    plan === "free" ? FreePlan : plan == "pro" ? ProPlan : BusinessPlan;
  new PlanClass(method, requestTime, checkInterval, currentMontiors, headers);
}