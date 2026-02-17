import nodemailer from "nodemailer"
import { Mail } from "./email.service.js"
import { resetPassword, alertMonitor } from "../utils/messages-email.util.js"
import { alertLimit } from "../utils/messages-email.util.js"

export const sentForgetEmail = async (resetLink: string, user: string, username: string) => {
    const userEmail = process.env.user_email
    const userPass = process.env.user_pass
    const resetPasswordHtml = resetPassword(username, resetLink)
    if (!userEmail || !userPass) return
    const newMail = new Mail(username, user, "Reset Password Axis Cloud", userEmail, userPass, resetPasswordHtml)
    newMail.transporter()
    newMail.mailOption()
    newMail.sendMail()
}

export const sentAlertEmail = async (username: string, status: string, serviceName: string, time: Date, slug: string, user: string, issue: boolean) => {
    const userEmail = process.env.user_email
    const userPass = process.env.user_pass
    const alertMonitorHtml = alertMonitor(username, status, serviceName, time, slug, issue)
    if (!userEmail || !userPass) return
    const newMail = new Mail(username, user, "Alert Monitor Axis Cloud", userEmail, userPass, alertMonitorHtml)
    newMail.transporter()
    newMail.mailOption()
    newMail.sendMail()
}

export const sentAlertLimit = async (username: string, user: string) => {
    const userEmail = process.env.user_email
    const userPass = process.env.user_pass
    if (!userEmail || !userPass) return
    const alertLimitHtml = alertLimit(username)
    const newMail = new Mail(username, user, "Alert Monitor Axis Cloud", userEmail, userPass, alertLimitHtml)
    newMail.transporter()
    newMail.mailOption()
    newMail.sendMail()
}
