
import {Schema,model,Document,Types}  from "mongoose"

import mongoose from "mongoose"







export interface IMontior {

    _id?: Types.ObjectId,
    userId : Types.ObjectId,
    url : string,
    method: string,
    requestTime : number,
    isActive : boolean
    checkInterval : number,
    Headers: Record<string, string> ,
    checkAt:number,
    plan : string
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
        default : "Get"
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
        type: String
    }
},{
    timestamps:true
})





export let Montior = model<IMontior> ("Montiors",montiorSchema)