import type {Request,Response,NextFunction} from "express"
import {User} from "../models/User.js"   
import {UserHelper} from "../utils/UserClass.js"
import { CreateLimitUser } from "../utils/ValadtionLimits.js"
import type {IUserDocument} from "../models/User.js"

import {hash} from "../utils/HashData.js"

import {Token} from "../models/Token.js"

import crypto from "crypto"
import {sentForgetEmail} from "../services/SendEmail.js"
import {GetCode} from "../utils/TokenChecks.js"
import  { Types } from "mongoose"



export async function CreateUser(req : Request , res: Response,next: NextFunction) {
    try{
        let {username,email,password} = req.body 
        let newUser = new UserHelper();
        newUser.username = username
        newUser.email = email
        await newUser.Hashpassword(password)
        let allUsers = await User.find()
        console.log(allUsers)
        console.log(newUser)
        let user  : any= await User.create({username:newUser.username,email:newUser.email,password:newUser.password})

        let token : string = newUser.CreateToken(newUser.username,user.role,user._id,user.plan)
        res.status(201).json({
                token,
                success:true,      
                username,
                plain : user.palin
        })
    }catch(err : any)
    {
        next(err)
    }
}


export async function Login (req : Request , res: Response,next: NextFunction) {
    try {
        let {password , email} = req.body;
        let newUser = new UserHelper();
        let user : any= await newUser.CheckUser(email)
        newUser.email = email
       
        await newUser.ComparePassword(user.password,password)
  
        let token : string = newUser.CreateToken(user.username,user.role,user._id,user.plan)
        console.log(user.plan)
        console.log(user.username)
         res.status(201).json({
                token,
                success:true,      
                username:user.username,
                plain :user.plain
        })
    }catch(err)
    {
        next(err)
    }
}







export async function CreateCode (req : Request , res : Response , next : NextFunction) {
    try{
        let {email} = req.body
        let newUser = new UserHelper();
        let user : any= await newUser.CheckUser(email)
        const token = crypto.randomBytes(32).toString("hex");
        await sentForgetEmail(token,email,user.username)
        await Token.create({token,userId:user._id})
        res.status(201).json()
    }catch(err)
    {
        console.log(err)
        next(err)
    }
}
 


export async function CheckCode (req : Request , res :Response , next : NextFunction ) {
    try{
        let token = (req.query.token as string) || ""
        let userId  : string= await GetCode(token)
        res.status(204).json()
    }catch(err)
    {
        next(err)
    }
}



export async function UpdatePassword(req : Request , res : Response , next : NextFunction) {
    try{
        let token = (req.query.token as string) || ""
        let password : string  = req.body.password
        let userId  : string =  await GetCode(token)
        let objectId : Types.ObjectId = new Types.ObjectId(userId);
        let newUser = new UserHelper()
    
        await newUser.UpdateUserData({password,_id:objectId})
        res.status(200).json()
    }catch(err)
    {
        next(err)
    }
}