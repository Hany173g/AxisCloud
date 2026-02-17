import paypal from "@paypal/paypal-server-sdk"
import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/error-handling.util.js"
import { checkIsUser } from "../utils/check-user.util.js"
import type { RequestUser } from "../types/custom-request.type.js"
import { client } from "../services/payment.service.js"
import type { IUserDocument } from "../models/user.model.js"
import { UserHelper } from "../utils/user-class.util.js"
import { createLog } from "../utils/payment-logs.util.js"
import { upgrade, checkCaptureStatus } from "../utils/payment.util.js"

const ordersController = new paypal.OrdersController(client);

export async function upgradeToPro(req: Request, res: Response, next: NextFunction) {
    try {
        const { service } = req.body
        const reqU = req as RequestUser
        const user: IUserDocument = await checkIsUser(reqU?.user)
        if (service != "pro" && service != "business") throw new AppError(400, "this value not allow")
        const amount = service === "pro" ? 50 : 100
        const response = await ordersController.createOrder(upgrade(service));
        await createLog("Monitor", service, response.result.id || "", user._id, "PayPal order created successfully", amount, "CREATED")
        res.status(200).json(response.result)
    } catch (err: any) {
        res.status(400).json(err.message)
    }
}

export async function captureOrder(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.body
        const reqU = req as RequestUser
        const user: IUserDocument = await checkIsUser(reqU?.user)
        const order = await ordersController.getOrder({ id });
        await checkCaptureStatus(order, user._id)
        res.status(200).json(order)
    } catch (err: any) {
        next(err)
    }
}
