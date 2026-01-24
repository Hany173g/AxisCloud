
import {Schema,model,Document,Types}  from "mongoose"

import mongoose from "mongoose"







interface IRateLimitlogs {
    path : string,
    apiKey : string,
    ip : string,
    userAgent: string,
    country: string
}





const rateLimtitLogsSchema = new Schema<IRateLimitlogs> ({
    path : {
        type : String , 
        required : true
    },
    apiKey : {
        type : String ,
        required : true
    },
    ip : {
        type : String,
        required : true
    },
    userAgent : {
        type : String,
        required : true
    },
    country : {
        type : String,
        required : true
    }
}, {
    timestamps : true
})

export const RateLimitLog  = model<IRateLimitlogs>("RateLimitLogs",rateLimtitLogsSchema)

