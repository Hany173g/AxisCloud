import { Schema, model, Document, Types } from "mongoose"

export interface IRateLimiting {
    userId: Types.ObjectId,
    apiKey: string,
}

const rateLimitingSchema = new Schema<IRateLimiting>({
    userId: Types.ObjectId,
    apiKey: String
}, {
    timestamps: true
})

export const RateLimiting = model<IRateLimiting>("RateLimiting", rateLimitingSchema)
