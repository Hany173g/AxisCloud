import { Schema, model, Document, Types } from "mongoose"

export interface IPaymentLog {
    typeService: string,
    typeUpgrade: string,
    paypalOrderId: string,
    userId: Types.ObjectId,
    message: string,
    amount: number,
    currency: string,
    status: string
}

const paymentLogSchema = new Schema<IPaymentLog>({
    typeService: {
        type: String,
        required: true
    },
    typeUpgrade: {
        type: String,
        required: true
    },
    paypalOrderId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: "USD"
    }
}, {
    timestamps: true
})

export const PaymentLog = model<IPaymentLog>("PaymentLogs", paymentLogSchema)
