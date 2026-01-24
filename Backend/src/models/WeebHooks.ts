import {Schema,model,Document,Types}  from "mongoose"

import mongoose from "mongoose"







export interface IWebHook {
    serivceId : Types.ObjectId,
    userId:Types.ObjectId,
    hooks: Record<string,string>
}




const webHookSchema = new Schema<IWebHook> ({
    serivceId:{
        type : Types.ObjectId,
        required: true
    },
    hooks:{
        type : Object,
        required : true
    },
    userId : {
        type : Types.ObjectId,
        required:true
    }
})




export let WebHook = model<IWebHook>("WebHooks",webHookSchema)



