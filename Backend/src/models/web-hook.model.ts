import { Schema, model, Document, Types } from "mongoose"

export interface IWebHook {
    serviceId: Types.ObjectId,
    userId: Types.ObjectId,
    hooks: Record<string, string>
}

const webHookSchema = new Schema<IWebHook>({
    serviceId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    hooks: {
        type: Object,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

export const WebHook = model<IWebHook>("WebHooks", webHookSchema)
