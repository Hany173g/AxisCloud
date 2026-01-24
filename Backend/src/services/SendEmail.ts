import nodemailer from "nodemailer"
import {Mail} from "./ClassEmail.js"
import {ResetPassword,AlertMontior} from "../utils/MessagesEmail.js"
import { AlertLimit } from "../utils/MessagesEmail.js"
export const sentForgetEmail = async(resetLink : string,user : string,username : string) => {
    let user_email = process.env.user_email
    let user_pass = process.env.user_pass
    let resetPasswordHtml = ResetPassword(username,resetLink)
    if (!user_email || !user_pass) return
    let newMail = new Mail(username,user,"Reset Password Axis Cloud",user_email,user_pass,resetPasswordHtml)
    newMail.transpoter()
    newMail.mailOption()
    newMail.sendMail()
}



export const sentAlertEmail = async(username : string,status : string , serviceName : string , time : Date , slug : string,user : string,issue : boolean)  => {
    let user_email = process.env.user_email
    let user_pass = process.env.user_pass
    let alertMontiorHtml= AlertMontior(username,status,serviceName,time,slug,issue)
    if (!user_email || !user_pass) return
    let newMail = new Mail(username,user,"Alert Montior Axis Cloud",user_email,user_pass,alertMontiorHtml)
    newMail.transpoter()
    newMail.mailOption()
    newMail.sendMail()
}





export const sentAlertLimit = async(username : string,user : string) => {
    let user_email = process.env.user_email
    let user_pass = process.env.user_pass
    if (!user_email || !user_pass) return
    let alertLimitHtml = AlertLimit(username)
    let newMail = new Mail(username,user,"Alert Montior Axis Cloud",user_email,user_pass,alertLimitHtml)
    newMail.transpoter()
    newMail.mailOption()
    newMail.sendMail()
}








