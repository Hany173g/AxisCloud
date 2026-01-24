
import {Schema,model,Document,Types}  from "mongoose"

import mongoose from "mongoose"











export interface IPaymentLogs{
    typeSerivce: string,
    typeUpgrade : string,
    paypalOrderId : string,
    userId: Types.ObjectId,
    message: string,
    amount: number,
    currency : string,
    status: string
}






let paymentLogSchema = new Schema<IPaymentLogs> ({
    typeSerivce : {
        type: String,
        required:true
    },
    typeUpgrade: {
        type: String,
        required : true
    },
    paypalOrderId : {
        type : String,
        required : true
    },
    amount: {
        type :Number,
        required:true
    },
    status : {
        type : String,
        required : true
    },
    userId: {
        type:Types.ObjectId,
        required:true
    },
    message: {
        type: String,
        required:true
    },
    currency: {
        type: String,
        default:"USD"
    }
},{
    timestamps:true
})






export const PaymentLog  = model<IPaymentLogs>("PaymentLogs",paymentLogSchema)


