import { Schema, model, Document, Types } from "mongoose"
import type { ObjectId } from "mongoose"

export interface ILimitUser {
    userId: Types.ObjectId
    alertCount: number
    coolDown: number
    lastAlert: number
    limitAlert: boolean
}

const limitUserSchema = new Schema<ILimitUser>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    alertCount: {
        type: Number,
        default: 0
    },
    coolDown: {
        type: Number,
        required: true
    },
    lastAlert: {
        type: Number,
        required: true
    },
    limitAlert: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

export const LimitUser = model<ILimitUser>("LimitUser", limitUserSchema)
