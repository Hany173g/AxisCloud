




import validator from "validator"
import {AppError} from "./ErrorHandling.js"
import {PlanUser} from "./Plans.js"
import {Montior} from "../models/Montior.js"
import {CreateUuid} from "./CreateSlug.js" 
import type {IUserDocument} from "../models/User.js"
import {Types }  from "mongoose"
import type {IMontiorDocument} from "../models/Montior.js"
import type {IMontior} from "../models/Montior.js"

export class MontiorHelper {
    private _url : string = ""
    private _method : string = ""
    private _requestTime : number = 5
    private _checkInterval : number = 5
    private _currentMontiors  : number = 0
    private _headers :  Record<string, string>  = {}
    private _name : string = ""
    


      get url() { return this._url}
      get method() { return this._method; }
      get requestTime() { return this._requestTime; }
      get checkInterval() { return this._checkInterval } 
      get headers() {return this._headers}
      get name() {return this._name}





    CheckUrl(url : string) {
    if (!validator.isURL(url))
        {
            throw new AppError(400,"This is not a URL")
        }
    
    }
    async CheckDuplicateNameMontior(name : string , userId : string) {
        if (name) {
            let montior = await Montior.findOne({name , userId})
            if (montior) throw new AppError(400,"This montior name is used, please choose antother value")
        }
    }
     CheckOwnerMontior(montiorUserId : Types.ObjectId,userId : string) {
       if (montiorUserId.toString() != userId) {
            throw new AppError(403,"You not allow to update this montior")
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
            throw new AppError(400,"This plan not allowed")
        }
        let limit : number =  await this.CheckCurrentMontiors(userData._id)
        this._currentMontiors = limit
        PlanUser(userData.plan,
            this._method,this._requestTime
            ,this._checkInterval,this._currentMontiors
            ,this._headers
        )
    }
    async GetMontior(montiorId : string) {
        let montior = await Montior.findById(montiorId)
        if (!montior) throw new AppError(404,"montior not found")
        return montior   
    }

    CheckMethod(method : string)
    {
        console.log(method)
        let allowMethods = ["GET","HEAD","POST"]
        if (!allowMethods.includes(method))
        {
            throw new AppError(400,"This method not allowed")
        }
    }
    CheckRequestTimeAInterval(requestTime : number)
    {
        if (typeof requestTime !== "number")
        {
             throw new AppError(400,"The time request not number")
        }
        return Math.floor(requestTime)
    }
    async CreateMontior(data :IMontior ) : Promise<IMontiorDocument>
    {
        let newMontior : IMontiorDocument = await Montior.create(data)
        if (!newMontior) {
            throw new AppError(500 ,"Faild to  create montior")
        }
        return newMontior
    }
    CheckHeadersValue (headers :  Record<string, string> ) {
      if (headers) {
          for (let key in headers) 
        {
            if (typeof headers[key] != "string")
            {
                throw new AppError(400,`value ${key} not allow ${typeof headers[key]}`)
            }
        }
      }  
    }
     async UpdateMontiorData(data : any,montiorId : string) {
        
        let updateMontior = await Montior.findOneAndUpdate({_id:montiorId},{$set:data},{new: true})
        if (!updateMontior) {
            throw new AppError(500, "Faild to update montior")
        }
        return updateMontior
    }
    
    set url(value : string) {
        this.CheckUrl(value)
        this._url = value
    }
    set method (value : string) {
        this.CheckMethod(value)
        this._method = value
    }
    set requestTime(value : number) {
        let request = this.CheckRequestTimeAInterval(value)
        this._requestTime = request
    }
    set checkInterval(value : number) {
        let interval = this.CheckRequestTimeAInterval(value)
        this._checkInterval = interval
    }
    set headers (value :  Record<string, string>  ) {
         if (value === undefined || value === null) return
        if (typeof value !== "object" || Array.isArray(value)) {
            throw new AppError(400, "Headers must be an object")
        }
        this.CheckHeadersValue(value)

        this._headers = value
    }
    set name (value : string) {
        if (typeof value !== "string" && typeof value !== "number")
        {
            throw new AppError(400,"This type not allow")
        }
        this._name = value
    }   
}


