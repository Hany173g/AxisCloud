  import nodemailer from "nodemailer"
import {Mail} from "./ClassEmail.js"
function ResetPassword(username : string , resetLink : string) {
    let ResetPasswordHtml =  `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>AxisCloud - Password Reset</title>
        <style>
            /* Reset basic styles */
            body, p, a { margin: 0; padding: 0; }
            body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            background-color: #f4f6f8; 
            color: #333; 
            line-height: 1.6; 
            padding: 20px;
            }
            .container {
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 8px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
            overflow: hidden;
            }
            .header {
            background-color: #007BFF; 
            color: white; 
            text-align: center; 
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
            }
            .content {
            padding: 30px 25px;
            font-size: 16px;
            color: #555;
            }
            .content p {
            margin-bottom: 15px;
            }
            .button {
            display: inline-block;
            background-color: #f44336;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
            }
            .footer {
            font-size: 12px;
            color: #999;
            text-align: center;
            padding: 20px;
            background-color: #f4f6f8;
            }
            @media screen and (max-width: 600px) {
            .container { width: 95%; padding: 10px; }
            .header { font-size: 20px; }
            .content { font-size: 14px; }
            .button { padding: 10px 20px; }
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">AxisCloud - Password Reset</div>
            <div class="content">
            <p>Hello ${username},</p>
            <p>We received a request to reset your password.</p>
            <p>Please click the button below to reset your password:</p>
            <a class="button" href="http://localhost:5173/reset-password?token=${resetLink}">Reset Password</a>
            <p>This link will expire in 5 minutes.</p>
            <p>Requested at: ${new Date().toLocaleString()}</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
            &copy; ${new Date().getFullYear()} AxisCloud Team. All rights reserved.
            </div>
        </div>
        </body>
        </html>
        `
        return ResetPasswordHtml
}

    

export const sentForgetEmail = async(resetLink : string,user : string,username : string) => {

    let user_email = process.env.user_email
    let user_pass = process.env.user_pass
    let ResetPasswordHtml = ResetPassword(username,resetLink)
    if (!user_email || !user_pass) return
    let newMail = new Mail(username,user,"Reset Password Axis Cloud",user_email,user_pass,ResetPasswordHtml,resetLink)
    newMail.transpoter()
    newMail.mailOption()
    newMail.sendMail()
}






export const sentEmail = async(resetLink : string,user : string,username : string) => {
    
  
    let user_email = process.env.user_email
    let user_pass = process.env.user_pass
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:user_email,
            pass:user_pass
        }
    })

    const mailOption = {
        from: user_email,
        to:user,
        subject: "Reset Password Axis Cloud",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>AxisCloud - Password Reset</title>
        <style>
            /* Reset basic styles */
            body, p, a { margin: 0; padding: 0; }
            body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            background-color: #f4f6f8; 
            color: #333; 
            line-height: 1.6; 
            padding: 20px;
            }
            .container {
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 8px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
            overflow: hidden;
            }
            .header {
            background-color: #007BFF; 
            color: white; 
            text-align: center; 
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
            }
            .content {
            padding: 30px 25px;
            font-size: 16px;
            color: #555;
            }
            .content p {
            margin-bottom: 15px;
            }
            .button {
            display: inline-block;
            background-color: #f44336;
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
            }
            .footer {
            font-size: 12px;
            color: #999;
            text-align: center;
            padding: 20px;
            background-color: #f4f6f8;
            }
            @media screen and (max-width: 600px) {
            .container { width: 95%; padding: 10px; }
            .header { font-size: 20px; }
            .content { font-size: 14px; }
            .button { padding: 10px 20px; }
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">AxisCloud - Password Reset</div>
            <div class="content">
            <p>Hello ${username},</p>
            <p>We received a request to reset your password.</p>
            <p>Please click the button below to reset your password:</p>
            <a class="button" href="http://localhost:5173/reset-password?token=${resetLink}">Reset Password</a>
            <p>This link will expire in 5 minutes.</p>
            <p>Requested at: ${new Date().toLocaleString()}</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
            &copy; ${new Date().getFullYear()} AxisCloud Team. All rights reserved.
            </div>
        </div>
        </body>
        </html>
        `


    }

        

    transporter.sendMail(mailOption,(err : any,suces : any) =>
    {
        if (err)
        {
            console.log("faild send email",err)
        }
        else
        {
            console.log("succes send email")
        }
    })
}





