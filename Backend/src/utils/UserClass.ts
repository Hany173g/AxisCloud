

import validator from "validator"

import bcrypt from "bcrypt"
import {User} from "../models/User.js"
import type {IUserDocument} from "../models/User.js"

import jwt from "jsonwebtoken"
import {AppError} from "./ErrorHandling.js"
import type  {UserType} from "../@types/CustomUserType.js"

export class UserHelper {
    private _username : string = "";
    private _password : string = "";
    private _email : string = "";
    set username(value : string)
    {
        if (value.length < 3)
        {
            throw new AppError(400,"The name must be longer than 3 letters")
        }
        this._username = value
    }
    set email(value : string)
    {
        if (!validator.isEmail(value))
        {
            throw new AppError(400,"This is not an email")
        }
        this._email = value
    }
     get username() { return this._username; }
    get email() { return this._email; }
    get password() { return this._password; }

    async DuplicateEmail(email : string)
    {
        let user = await User.findOne({email})
        if (user)
        {
            throw new AppError(400,"This email address is already in use")
        }
    }


     CreateToken(username : string , role : string , _id : string,plan : string)
    {
        let secert = process.env.JWT_ACCESS|| "AXISCLOUD"

        let token : string = jwt.sign({username,role,_id,plan} ,
            secert,{
            expiresIn:"4d"})
        return token;
    }

    private CheckPasswordRules(value : string)
    {
        if (!value ) throw new AppError(400,"Password Is required")
            if (typeof value != "string") throw new AppError(400,"The data is incorrect") 
            if (value.length < 3) throw new AppError(400,"Password Is Very Short")
            else if (value.length < 6) throw new AppError(400,"Password Is Weak")
            else if (value.includes(" ")) throw new AppError(400,"The password contains spaces") 
    }

    roleChecks (value : string)
    {
        let allowRoles = ["admin","member","support"]
        if (allowRoles.includes(value))
        {
            throw new AppError(400,"This value does not exist")
        }
    }

    async CheckUser(email : string) : Promise<IUserDocument> 
    {
        let user = await User.findOne({email})
        if (!user)
        {
            throw new AppError(404,"This email not found")
        }
        return user
    }

   async ComparePassword(hashedPassword: string , inputPassword : string)
    {
        this.CheckPasswordRules(inputPassword)
        console.log(hashedPassword)
        console.log(inputPassword)
        const isMatch = await bcrypt.compare(inputPassword,hashedPassword)
        console.log(isMatch)
        if (!isMatch)
        {
            throw new AppError(400,"Password is incorrect")
        }
    }
     async Hashpassword(value : string)
    {
        value.toString()
   
        this.CheckPasswordRules(value)
        let hash = await bcrypt.hash(value , 10)
        this._password = hash
    }
    async GetUserById(id : string)   : Promise<IUserDocument> 
    {
        let user = await User.findById(id)
        if (!user)
        {
            throw new AppError(404,("This user does not exist"))
        }
        
        return user
    }
    async UpdateUserData(data : UserType ) {
        let userData : UserType = {...data} ;
        if (data.password)
        {
            this.CheckPasswordRules(data.password)
           await this.Hashpassword(data.password)
           userData.password = this._password
        }
        if (data.username)
        {
             if (data.username.length < 3)
        {
                throw new AppError(400,"The name must be longer than 3 letters")
        }
        userData.username = data.username
        }
        if (data.role)
        {
            this.roleChecks(data.role)
            userData.role = data.role
        }
        if (data.email)
        {
            this.email = data.email
            userData.email = this.email
        }
        let userId = userData._id
        delete userData._id
        await User.findByIdAndUpdate(data._id,userData)
    }
}