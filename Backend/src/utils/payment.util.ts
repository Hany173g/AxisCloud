import paypal from "@paypal/paypal-server-sdk"
import { createLog } from "./payment-logs.util.js"
import { PaymentLog } from "../models/payment-log.model.js"
import { Monitor } from "../models/monitor.model.js"
import { AppError } from "./error-handling.util.js";
import { client } from "../services/payment.service.js"
import type { IPaymentLog } from "../models/payment-log.model.js"
import { UserHelper } from "./user-class.util.js"

const ordersController = new paypal.OrdersController(client);

import { Types } from "mongoose"

import { upgradeLimitUser } from "./validation-limits.util.js";

const PRICES = {
    pro: "50",
    business: "100"
};

export function upgrade(service: "pro" | "business") {
    const frontendUrl = process.env.FRONTEND_URL
    const requestBody = {
        body: {
            intent: paypal.CheckoutPaymentIntent.Capture,
            applicationContext: {
                landingPage: paypal.OrderApplicationContextLandingPage.Login,
                userAction: paypal.OrderApplicationContextUserAction.PayNow,
                returnUrl: `${frontendUrl}/payment/success`,
                cancelUrl: `${frontendUrl}/payment/cancel_url`
            },
            payer: {
                emailAddress: "hanykholey1@gmail.com"
            },
            purchaseUnits: [
                {
                    referenceId: service,
                    amount: { currencyCode: "USD", value: PRICES[service] },
                    description: `${service} description`,
                    customId: `user_2312312312_order_${service} sub`
                }
            ]
        }
    };
    return requestBody
}

async function getLog(paypalOrderId: string) {
    const checkPaymentOrder: IPaymentLog = await PaymentLog.find({ paypalOrderId }).lean<IPaymentLog>()
    if (!checkPaymentOrder) {
        throw new AppError(404, "This order not created")
    }
    return checkPaymentOrder
}

async function updateMonitors(userId: Types.ObjectId, plan: string) {
    await Monitor.updateMany(
        { userId },
        { $set: { plan } }
    )
}

export async function checkCaptureStatus(order: any, userId: Types.ObjectId) {
    if (!order) throw new AppError(400, "This id is waring")
    const orderId = order.result.id;
    const paymentOrder = await getLog(orderId);

    if (paymentOrder && paymentOrder.status === "COMPLETED") {
        await createLog(
            "Monitor",
            paymentOrder.typeService,
            orderId,
            userId,
            "Payment already completed",
            paymentOrder.amount,
            "COMPLETED",
            "USD"
        );
        return;
    }

    if (order.result.status !== "APPROVED") {
        throw new AppError(400, "You have not agreed to the payment process.");
    }

    try {
        const response = await ordersController.captureOrder({ id: orderId });
        let message: string;

        if (response.result.status === "COMPLETED") {
            message = "Payment completed successfully";
            const newUser = new UserHelper();
            const plan: string = paymentOrder.typeUpgrade;
            await newUser.updatePlan(userId, { plan });
            await updateMonitors(userId, plan);
            await upgradeLimitUser(userId, plan)
            await createLog(
                "Monitor",
                paymentOrder.typeService,
                response.result.id || "",
                userId,
                message,
                paymentOrder.amount,
                "COMPLETED",
                "USD"
            );
        } else {
            message = "Order approved but capture failed";
            await createLog(
                "Monitor",
                paymentOrder.typeService,
                response.result.id || "",
                userId,
                message,
                paymentOrder.amount,
                "FAILED",
                response.result.status,
            );
        }
    } catch (err: any) {
        // Handle PayPal API errors, especially 422 COMPLIANCE_VIOLATION
        if (err.statusCode === 422 && err.result?.details?.[0]?.issue === "COMPLIANCE_VIOLATION") {
            // Retry once after 3 seconds for sandbox compliance issues
            await new Promise(resolve => setTimeout(resolve, 3000));
            try {
                const retryResponse = await ordersController.captureOrder({ id: orderId });
                if (retryResponse.result.status === "COMPLETED") {
                    const message = "Payment completed successfully after retry";
                    const newUser = new UserHelper();
                    const plan: string = paymentOrder.typeUpgrade;
                    await newUser.updatePlan(userId, { plan });
                    await updateMonitors(userId, plan);
                    await upgradeLimitUser(userId, plan);
                    await createLog("Monitor", paymentOrder.typeService, retryResponse.result.id || "", userId, message, paymentOrder.amount, "COMPLETED", "USD");
                    return;
                } else {
                    throw new AppError(400, "PayPal could not process this payment even after retry. Please try again or use a different test account.");
                }
            } catch (retryErr: any) {
                throw new AppError(400, "PayPal could not process this payment due to compliance restrictions. This can happen in sandbox mode. Please try again or use a different test account.");
            }
        }
        // Generic PayPal API error
        if (err.statusCode && err.result?.message) {
            throw new AppError(err.statusCode, `PayPal error: ${err.result.message}`);
        }
        // Fallback
        throw new AppError(500, "Payment capture failed. Please try again.");
    }
}
