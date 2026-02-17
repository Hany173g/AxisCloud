import type { Types } from "mongoose";
import { PaymentLog } from "../models/payment-log.model.js"
import { AppError } from "./error-handling.util.js";

export async function createLog(typeService: string, typeUpgrade: string, paypalOrderId: string, userId: Types.ObjectId, message: string, amount: number, status: string, currency: string = "USD") {
    await PaymentLog.create({ typeService, typeUpgrade, paypalOrderId, userId, message, amount, status, currency })
}
