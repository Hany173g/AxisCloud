import paypal, { OrdersController } from "@paypal/paypal-server-sdk"

import type {Request,Response,NextFunction} from "express"

import {AppError} from "../utils/ErrorHandling.js"

import {CheckIsUser} from "../utils/CheckUser.js"

import type {RequestUser} from "../@types/CustomRequest.js"

import {client} from "../services/Payment.js"

import type {IUserDocument} from "../models/User.js"

import {UserHelper} from "../utils/UserClass.js"

import {CreateLog} from "../utils/PaymentLogs.js"

import {Upgrade} from "../utils/Payment.js"

import {CheckCaptureStatus} from "../utils/Payment.js"



const ordersController = new OrdersController(client);









export async function UpgradeToPro(req : Request,res: Response, next : NextFunction) {

  try{

    let {serivce}  = req.body

    let reqU = req as RequestUser

    let user : IUserDocument = await CheckIsUser(reqU?.user)

    if (serivce != "pro" && serivce != "business") throw new AppError(400,"this value not allow")

    let amount = serivce === "pro" ? 50 : 100

    const response = await ordersController.createOrder(Upgrade(serivce));

    await CreateLog("Montior",serivce,response.result.id || "",user._id,"PayPal order created successfully",amount,"CREATED")

    res.status(200).json(response.result)

  }catch(err : any)

  {

    console.log(err.message)

    res.status(400).json(err.message)

  }

}











  



export async function CaptureOrder(req : Request, res : Response , next : NextFunction)

{

    try{

        const {id} = req.body

        let reqU = req as RequestUser

        let user : IUserDocument = await CheckIsUser(reqU?.user)

        const order = await ordersController.getOrder({id});

        await CheckCaptureStatus(order,user._id)

        res.status(200).json(order)

    }catch(err : any)

    {

      console.log(err)

      next(err)

    }

}