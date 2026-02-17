import { Schema, model, Document, Types } from "mongoose"

interface IRateLimitLog {
    path: string,
    apiKey: string,
    ip: string,
    userAgent: string,
    country: string
}

const rateLimitLogSchema = new Schema<IRateLimitLog>({
    path: {
        type: String,
        required: true
    },
    apiKey: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export const RateLimitLog = model<IRateLimitLog>("RateLimitLogs", rateLimitLogSchema)
