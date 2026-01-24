


import {Schema,model,Document,Types}  from "mongoose"

import mongoose from "mongoose"
import { types } from "node:util"











export interface ILogs {
    
    montiorId : Types.ObjectId,
    status: string,
    httpStatus: number,
    responseTime : number,

}




let logsSchema = new Schema<ILogs> ({
    montiorId:{ type:Types.ObjectId,ref:"Montiors"},
    status : String,
    httpStatus:Number,
    responseTime: Number
    
},{
    timestamps:true
})




export const Log  = model<ILogs>("MontiorLogs",logsSchema)



export interface IDocumentLogs extends ILogs, Document {}
