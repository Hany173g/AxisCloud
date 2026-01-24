import type { Types } from "mongoose";
import {PaymentLog} from "../models/PaymentLogs.js"
import { AppError } from "./ErrorHandling.js";



















export async function CreateLog(typeSerivce : string , typeUpgrade : string , paypalOrderId : string , userId : Types.ObjectId,message : string , amount : number   , status : string ,currency: string = "USD")
{
    await PaymentLog.create({typeSerivce,typeUpgrade,paypalOrderId,userId,message,amount,status,currency})
}