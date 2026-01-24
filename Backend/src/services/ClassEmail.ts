  import nodemailer from "nodemailer"











export class Mail {

   constructor(public username : string , public user : string  ,public title : string, public user_email : string , public user_pass : string ,  public html : string) {
        this.username = username
        this.user = user
        this.title = title
        this.html = html
     
        this.user_email = user_email
        this.user_pass = user_pass
    }
    transpoter()
    {
          
            const transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:this.user_email,
                    pass:this.user_pass
                }
            })
        return transporter
    }
    mailOption()
    {
        return {
            from :this.user_email,
            to:this.user,
            subject: this.title,
            html: this.html
        }
    }
    sendMail()
    {
        let transporter = this.transpoter()
        transporter.sendMail(this.mailOption(),(err : any , succes : any) => {
            if (err)
            {
                console.log("faild send email", err)
            }
            else
            {
                console.log("success send email")
            }
        })
    }
}