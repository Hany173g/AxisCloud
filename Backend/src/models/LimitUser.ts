

import {Schema,model,Document,Types}  from "mongoose"







export interface ILimitUser {
    userId: Types.ObjectId
    alertCount : number
    coolDown : number
    lastAlert : number
    limitAlert : boolean
}



let limitUserSchema = new Schema<ILimitUser> ({
    userId:{
        type:Types.ObjectId,
        required:true
    },
    alertCount : {
        type: Number,
        default:0
    },
    coolDown: {
        type : Number,
        required: true
    },
    lastAlert : {
        type : Number,
        required:true
    },
    limitAlert:{
        type : Boolean,
        default : false
    }
},{
    timestamps:true
})


export const LimitUser  = model<ILimitUser>("LimitUser",limitUserSchema)

















