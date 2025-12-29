import mongoose,{Schema,model,Document} from "mongoose"







export interface IUser {
    username: string,
    password:string,
    email:string,
    role: string,
    plan: string
}









let userSchema = new  Schema<IUser> ({
    username: {
        type: String,
        required:true,

    },
      password: {
        type: String,
        required:true,
        minlength:6

    },
      email: {
        type: String,
        required:true,
        unique:true

    },
      role: {
        type: String,
        default:"user"
    },
    plan :{ 
      type:  String,
      default : "free"
    }
    
},{
  timestamps:true
})


export const User = model<IUser>('User', userSchema);


userSchema.index({ email: 1 }, { unique: true });
User.init().then(() => {
  console.log("Sucess init")
})

export interface IUserDocument extends IUser, Document {}