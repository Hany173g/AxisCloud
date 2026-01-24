
import {Schema,model,Document,Types}  from "mongoose"

import mongoose from "mongoose"







export interface IMontior {
    userId : Types.ObjectId,
    url : string,
    method: string,
    requestTime : number,
    isActive : boolean
    checkInterval : number,
    Headers: Record<string, string> ,
    checkAt:number,
    plan : string,
    name: string,
    slug : string,
    status: string
    isAlerts: boolean
}






let montiorSchema = new Schema<IMontior>  ({
    userId : {
        type : Types.ObjectId,
        ref: "User"
    },
    url : {
        type: String,
        required:true
    },
    method : {
        type : String,
        default : "GET"
    },
    requestTime : {
        type : Number,
        default : 5
    },
    checkInterval : {
        type : Number
    },
    Headers:{
        type :Object
    },
    checkAt: {
        type :Number
    },
    plan: {
        type: String,
        required:true
    },
    name : {
        type: String,
        required:true
    },
    slug: {
        type: String,
        required:true
    },
    isActive:{
        type : Boolean,
        default : true
    },
    status: {
        type : String,
        default : "up"
    },
    isAlerts: {
        type : Boolean,
        default : true
    }
},{
    timestamps:true
})





export let Montior = model<IMontior> ("Montiors",montiorSchema)

export interface IMontiorDocument extends IMontior, Document {}