import {AppError} from "../utils/ErrorHandling.js"
 import type {Request,Response,NextFunction} from "express"










const RequiredFields = (err : any) => {
    let error = err.message.match(/`.*?`/g);
    
    let message = `${error} is Required`
    return new AppError(400, message);
}

const DuplicateMongodb = (err : any) => {
    let error = Object.keys(err.keyValue).join(', ')
    let message = `This ${error}  is in use. Please choose another value.`
   
    return new AppError(400,  message)
}



const sendErrorDev = (err : any,res : Response) => {
    res.status(err.statusCode) .json({
        message:err.message,
        stack:err.stack,
        error:err,
        status:err.status
    })
}

const sendErroProduction = (err : any,res : Response) => {
    if (err.isOperational)
    {
        res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
    }
    else
    {
        res.status(500).json({
        status: "error",
        message: "Someting is wrong!", 

    })
}
}




export function GlobalErrorHandling(err: any,req : Request , res: Response,next: NextFunction) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    console.log(err.code)
    if (process.env.NODE_ENV === "development") {
    sendErrorDev(err as AppError, res); 
    }else{
        if (err.message.includes("required")) err = RequiredFields(err)
        if (err.code == 11000) err = DuplicateMongodb(err)
        sendErroProduction(err as AppError,res)   
    }
}
















