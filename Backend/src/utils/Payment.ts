















import paypal, { OrdersController ,CheckoutPaymentIntent,OrderApplicationContextLandingPage,OrderApplicationContextUserAction} from "@paypal/paypal-server-sdk"

import {CreateLog} from "./PaymentLogs.js"

import {PaymentLog} from "../models/PaymentLogs.js"

import {Montior} from "../models/Montior.js"

import { AppError  } from "./ErrorHandling.js";

import {client} from "../services/Payment.js"

import type {IPaymentLogs} from "../models/PaymentLogs.js"

import {UserHelper} from "./UserClass.js"

const ordersController = new OrdersController(client);

import {Types} from "mongoose"

import { UpgradeLimitUser } from "./ValadtionLimits.js";

const prices = {

  pro: "50",

  business: "100"

};















export function Upgrade(serivce : "pro" | "business") {

  let frontendUrl = process.env.FRONTEND_URL

  const requestBody = {

  body :{

    intent: CheckoutPaymentIntent.Capture,

    applicationContext:{

      landingPage: OrderApplicationContextLandingPage.Login,

      userAction:OrderApplicationContextUserAction.PayNow,

      returnUrl:`${frontendUrl}/payment/success`,

      cancelUrl:`${frontendUrl}/payment/cancel_url`

  },

  payer:{

    emailAddress:"hanykholey1@gmail.com"

  },

  purchaseUnits: [

    {

      referenceId: serivce,

      amount: { currencyCode: "USD", value: prices[serivce] },

      description:`${serivce} description`,

      customId: `user_2312312312_order_${serivce} sub`

    }

  ] 

  }

};

  return requestBody

}









async function GetLog(paypalOrderId : string) {

    let  checkPaymentOrder : IPaymentLogs = await PaymentLog.find({paypalOrderId}).lean<IPaymentLogs>()

    if (!checkPaymentOrder)

    {

        throw new AppError(404,"This order not created")

    }

    return checkPaymentOrder

}





async function UpdateMontiors(userId : Types.ObjectId , plan : string) {

   await Montior.updateMany(

      {userId},

      {$set:{plan}}

    )



}











export async function CheckCaptureStatus(order : any,userId : Types.ObjectId) {

          if (!order) throw new AppError(400,"This id is waring")

           const orderId = order.result.id;

        

           const paymentOrder = await GetLog(orderId); 

          

           if (paymentOrder && paymentOrder.status === "COMPLETED") {

            await CreateLog(

              "Montior",

              paymentOrder.typeSerivce,

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
          const response = await ordersController.captureOrder({id:orderId});

          let message: string;

          if (response.result.status === "COMPLETED") {

                message = "Payment completed successfully";

                const newUser = new UserHelper(); 

                const plan: string = paymentOrder.typeUpgrade;

                await newUser.UpdatePlan(userId, { plan });

                await UpdateMontiors(userId, plan);

                await UpgradeLimitUser(userId , plan)

          await CreateLog(

            "Montior",

            paymentOrder.typeSerivce,

            response.result.id || "",

            userId,

            message,

            paymentOrder.amount,

            "COMPLETED",

            "USD"

          );

        } else {

          message = "Order approved but capture failed";



          await CreateLog(

            "Montior",

            paymentOrder.typeSerivce,

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
          const retryResponse = await ordersController.captureOrder({id:orderId});
          if (retryResponse.result.status === "COMPLETED") {
            const message = "Payment completed successfully after retry";
            const newUser = new UserHelper(); 
            const plan: string = paymentOrder.typeUpgrade;
            await newUser.UpdatePlan(userId, { plan });
            await UpdateMontiors(userId, plan);
            await UpgradeLimitUser(userId , plan);
            await CreateLog("Montior", paymentOrder.typeSerivce, retryResponse.result.id || "", userId, message, paymentOrder.amount, "COMPLETED", "USD");
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