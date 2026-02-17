import { Schema, model, Document, Types } from "mongoose"

export interface IMonitor {
    userId: Types.ObjectId,
    url: string,
    method: string,
    requestTime: number,
    isActive: boolean
    checkInterval: number,
    headers: Record<string, string>,
    checkAt: number,
    plan: string,
    name: string,
    slug: string,
    status: string
    isAlerts: boolean
}

const monitorSchema = new Schema<IMonitor>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    url: {
        type: String,
        required: true
    },
    method: {
        type: String,
        default: "GET"
    },
    requestTime: {
        type: Number,
        default: 5
    },
    checkInterval: {
        type: Number
    },
    headers: {
        type: Object
    },
    checkAt: {
        type: Number
    },
    plan: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: "up"
    },
    isAlerts: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

export const Monitor = model<IMonitor>("Monitors", monitorSchema)

export interface IMonitorDocument extends IMonitor, Document { }
