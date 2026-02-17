import paypal from "@paypal/paypal-server-sdk";
import dotenv from "dotenv"

dotenv.config()

export const client = new paypal.Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID || "",
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
        oAuthClockSkew: 300
    },
    timeout: 0,
    environment: process.env.PAYPAL_MODE === "sandbox" ? paypal.Environment.Sandbox : paypal.Environment.Production,
})
