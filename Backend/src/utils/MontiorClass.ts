




import validator from "validator"
import {AppError} from "./ErrorHandling.js"
import {FreePlan,ProPlan,BusinessPlan} from "./Plans.js"
import type {Plans} from "./Plans.js"
import {Montior} from "../models/Montior.js"

import type {IUserDocument} from "../models/User.js"
import {Types }  from "mongoose"




export class MontiorHelper {
    private _url : string = ""
    private _method : string = ""
    private _requestTime : number = 5
    private _checkInterval : number = 5
    private _maxMontiors  : number = 5
    private _headers :  Record<string, string>  = {}


      get url() { return this._url}
      get method() { return this._method; }
      get requestTime() { return this._requestTime; }
      get checkInterval() { return this._checkInterval } 
      get headers() {return this._headers}
    CheckUrl(url : string) {
        if (!validator.isURL(url))
        {
            throw new AppError(400,"This is not a URL")
        }
    
    }
    async CheckCurrentMontiors(id :  Types.ObjectId )
    {
       
        let limit = await Montior.find({userId:id})
        return limit.length
    }
    async CheckPlan(userData : IUserDocument){
        let allowPlans = ["free","pro","business"]
        let plan = userData.plan
        if (!allowPlans.includes(plan))
        {
            throw new AppError(400,"Something went wrong")
        }
        let PlanClass = plan === "free" ? FreePlan : plan == "pro" ? ProPlan : BusinessPlan
        let limit : number =  await this.CheckCurrentMontiors(userData._id)
        this._maxMontiors = limit
        let newFreePlan = new PlanClass(this._method,this._requestTime,this._checkInterval,this._maxMontiors,this._headers)
    }

    CheckMethod(method : string)
    {
        let allowMethods = ["GET","HEAD","POST"]
        if (!allowMethods.includes(method))
        {
            throw new AppError(400,"The data is not correct")
        }
    }
    CheckRequestTimeAInterval(requestTime : number)
    {
        if (typeof requestTime !== "number")
        {
             throw new AppError(400,"The data is not correct")
        }
        return Math.floor(requestTime)
    }
    async CreateMontior(url : string,userId: Types.ObjectId,method : string , requestTime : number , checkInterval : number,Headers : object,checkAt : number,plan : string)
    {
     
        await Montior.create({url , userId,method,requestTime,checkInterval,Headers,checkAt,plan})
    }
    CheckHeadersValue (headers :  Record<string, string> ) {
        for (let key in headers) 
        {
            if (typeof headers[key] != "string")
            {
                throw new AppError(400,`value ${key} not allow ${typeof headers[key]}`)
            }
        }
    }
    set url(value : string) {
        this.CheckUrl(value)
        this._url = value
    }
    set method (value : string)
    {
        this.CheckMethod(value)
        this._method = value
    }
    set requestTime(value : number)
    {
        let request = this.CheckRequestTimeAInterval(value)
        this._requestTime = request
    }
    set checkInterval(value : number)
    {
        let interval = this.CheckRequestTimeAInterval(value)
        this._checkInterval = interval
    }
    set headers (value :  Record<string, string>  )
    {
         if (value === undefined || value === null) return
        if (typeof value !== "object" || Array.isArray(value)) {
            throw new AppError(400, "Headers must be an object")
        }
        this.CheckHeadersValue(value)

        this._headers = value
    }
    
}