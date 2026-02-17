import validator from "validator"
import bcrypt from "bcrypt"
import { User } from "../models/user.model.js"
import type { IUserDocument } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { AppError } from "./error-handling.util.js"
import type { UserType } from "../types/custom-user-type.type.js"
import { Types } from "mongoose"

export class UserHelper {
    private _username: string = "";
    private _password: string = "";
    private _email: string = "";

    set username(value: string) {
        if (value.length < 3) {
            throw new AppError(400, "The name must be longer than 3 letters")
        }
        this._username = value
    }

    set email(value: string) {
        if (!validator.isEmail(value)) {
            throw new AppError(400, "This is not an email")
        }
        this._email = value
    }

    get username() { return this._username; }
    get email() { return this._email; }
    get password() { return this._password; }

    async duplicateEmail(email: string) {
        const user = await User.findOne({ email })
        if (user) {
            throw new AppError(400, "This email address is already in use")
        }
    }

    createToken(username: string, role: string, _id: string, plan: string) {
        const secret = process.env.JWT_ACCESS || "AXISCLOUD"
        const token: string = jwt.sign({ username, role, _id, plan },
            secret, {
            expiresIn: "4d"
        })
        return token;
    }

    private checkPasswordRules(value: string) {
        if (!value) throw new AppError(400, "Password Is required")
        if (typeof value != "string") throw new AppError(400, "The data is incorrect")
        if (value.length < 3) throw new AppError(400, "Password Is Very Short")
        else if (value.length < 6) throw new AppError(400, "Password Is Weak")
        else if (value.includes(" ")) throw new AppError(400, "The password contains spaces")
    }

    roleChecks(value: string) {
        const allowRoles = ["admin", "member", "support"]
        if (allowRoles.includes(value)) {
            throw new AppError(400, "This value does not exist")
        }
    }

    async checkUser(email: string): Promise<IUserDocument> {
        const user = await User.findOne({ email })
        if (!user) {
            throw new AppError(404, "This email not found")
        }
        return user
    }

    async comparePassword(hashedPassword: string, inputPassword: string) {
        this.checkPasswordRules(inputPassword)
        const isMatch = await bcrypt.compare(inputPassword, hashedPassword)
        if (!isMatch) {
            throw new AppError(400, "Password is incorrect")
        }
    }

    async hashPassword(value: string) {
        value.toString()
        this.checkPasswordRules(value)
        const hash = await bcrypt.hash(value, 10)
        this._password = hash
    }

    async getUserById(id: string): Promise<IUserDocument> {
        const user = await User.findById(id)
        if (!user) {
            throw new AppError(404, ("This user does not exist"))
        }
        return user
    }

    async updatePlan(id: Types.ObjectId, data: Record<string, string>) {
        if (data.plan != "pro" && data.plan != "business")
            await User.findByIdAndUpdate(id, data)
    }

    async updateUserData(data: UserType) {
        let userData: UserType = { ...data };
        if (data.password) {
            this.checkPasswordRules(data.password)
            await this.hashPassword(data.password)
            userData.password = this._password
        }
        if (data.username) {
            if (data.username.length < 3) {
                throw new AppError(400, "The name must be longer than 3 letters")
            }
            userData.username = data.username
        }
        if (data.role) {
            this.roleChecks(data.role)
            userData.role = data.role
        }
        if (data.email) {
            this.email = data.email
            userData.email = this.email
        }
        const { _id, ...user } = userData
        await User.findByIdAndUpdate(_id._id, user)
    }
}
