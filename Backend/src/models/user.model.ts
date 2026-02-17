import mongoose, { Schema, model, Document } from "mongoose"

export interface IUser {
    username: string,
    password: string,
    email: string,
    role: string,
    plan: string
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: "user"
    },
    plan: {
        type: String,
        default: "business"
    }
}, {
    timestamps: true
})

export const User = model<IUser>('User', userSchema);

userSchema.index({ email: 1 }, { unique: true });
User.init().then(() => {
    console.log("Success init")
})

export interface IUserDocument extends IUser, Document { }
