
import {Schema,model,Document,Types}  from "mongoose"

import mongoose from "mongoose"











export interface IRateLimting {
    userId: Types.ObjectId,
    apiKey : string,
}










const rateLimtingSchema = new Schema<IRateLimting> ({
    userId : Types.ObjectId,
    apiKey: String
}, {
    timestamps:true
})


export const RateLimting  = model<IRateLimting>("RateLimting",rateLimtingSchema)

