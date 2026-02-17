import { AppError } from "../utils/error-handling.util.js"
import type { Request, Response, NextFunction } from "express"

const duplicateMongodb = (err: any) => {
    const error = Object.keys(err.keyValue).join(', ')
    const message = `This ${error} is in use. Please choose another value.`

    return new AppError(400, message)
}

const sendErrorDev = (err: any, res: Response) => {
    res.status(err.statusCode).json({
        message: err.message,
        stack: err.stack,
        error: err,
        status: err.status
    })
}

const sendErrorProduction = (err: any, res: Response) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        res.status(500).json({
            status: "error",
            message: "Something is wrong!",
        })
    }
}

export function globalErrorHandling(err: any, req: Request, res: Response, next: NextFunction) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err as AppError, res);
    } else {
        if (err.code == 11000) err = duplicateMongodb(err)
        sendErrorProduction(err as AppError, res)
    }
}
