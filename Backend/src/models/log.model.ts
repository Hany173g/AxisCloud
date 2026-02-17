import { Schema, model, Document, Types } from "mongoose"

export interface ILog {
    monitorId: Types.ObjectId,
    status: string,
    httpStatus: number,
    responseTime: number,
}

const logsSchema = new Schema<ILog>({
    monitorId: { type: Schema.Types.ObjectId, ref: "Monitors" },
    status: String,
    httpStatus: Number,
    responseTime: Number

}, {
    timestamps: true
})

export const Log = model<ILog>("MonitorLogs", logsSchema)

export interface ILogDocument extends ILog, Document { }
