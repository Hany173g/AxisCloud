import nodemailer from "nodemailer"

export class Mail {
    constructor(public username: string, public user: string, public title: string, public userEmail: string, public userPass: string, public html: string) {
        this.username = username
        this.user = user
        this.title = title
        this.html = html
        this.userEmail = userEmail
        this.userPass = userPass
    }

    transporter() {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.userEmail,
                pass: this.userPass
            }
        })
        return transporter
    }

    mailOption() {
        return {
            from: this.userEmail,
            to: this.user,
            subject: this.title,
            html: this.html
        }
    }

    sendMail() {
        const transporter = this.transporter()
        transporter.sendMail(this.mailOption(), (err: any, success: any) => {
            if (err) {
                console.log("failed send email", err)
            }
            else {
                console.log("success send email")
            }
        })
    }
}
