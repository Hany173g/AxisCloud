export function ResetPassword(username : string , resetLink : string) {
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









export function AlertMontior(username : string,status : string,serviceName : string,time : Date,slug : string , issue  : boolean) {
    let FRONTEND_URL = process.env.FRONTEND_URL || ""
    let montiorUrl : string  = FRONTEND_URL  + "monitors/"+ slug
    let message = issue ? "Your monitored service has encountered an issue:"  : "The website service has been restored:"
   let html =  `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UpMonitor Alert</title>
    <style>
        body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        }
        .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .header {
        background-color: #e74c3c; /* لون أحمر للتنبيه */
        color: white;
        padding: 15px;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        }
        .body {
        padding: 20px;
        color: #333;
        }
        .body p {
        margin: 10px 0;
        }
        .body a {
        display: inline-block;
        margin-top: 15px;
        padding: 10px 15px;
        background-color: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        }
        .footer {
        padding: 15px;
        font-size: 12px;
        color: #777;
        text-align: center;
        border-top: 1px solid #634343ff;
        }
    </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
        UpMonitor Alert
        </div>
        <div class="body">
        <p>Hello <strong>${username}</strong>,</p>
        <p>${message}</p>
        <p>
            <p>Montior</p>
            <strong>Service Name:</strong> ${serviceName}<br>
            <strong>Status:</strong> ${status}<br>
            <strong>Time:</strong> ${time}<br>
        </p>
        <a href="${montiorUrl}">View Montior</a>
        </div>
        <div class="footer">
        This is an automated alert from UpMonitor. Please do not reply to this email.
        </div>
    </div>
    </body>
    </html>
    `
return html
}

export function AlertLimit(username : string) {
    let html = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Alert Limit Reached</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#ff4d4f;color:#ffffff;padding:20px;text-align:center;font-size:20px;font-weight:bold;">
              Alert Limit Reached
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:24px;color:#333333;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 12px 0;">
                Hello ${username},
              </p>

              <p style="margin:0 0 12px 0;">
                You have reached the maximum allowed number of <strong>alerts</strong> for your account.
              </p>

              <p style="margin:0 0 12px 0;">
               
              </p>

              <p style="margin:0;">
                If you believe this is a mistake, please contact our support team.
              </p>
            </td>
          </tr>

         

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:16px;text-align:center;color:#888888;font-size:12px;">
              If you did not perform this action, you can safely ignore this email.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`
return html
}