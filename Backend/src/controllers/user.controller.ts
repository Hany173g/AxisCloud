import type { Request, Response, NextFunction } from "express"
import { User } from "../models/user.model.js"
import { UserHelper } from "../utils/user-class.util.js"
import { createLimitUser } from "../utils/validation-limits.util.js"
import type { IUserDocument } from "../models/user.model.js"

import { hash } from "../utils/hash-data.util.js"

import { Token } from "../models/token.model.js"

import crypto from "crypto"
import { sentForgetEmail } from "../services/send-email.service.js"
import { getCode } from "../utils/token-checks.util.js"
import { Types } from "mongoose"

export async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, email, password } = req.body
        const newUser = new UserHelper();
        newUser.username = username
        newUser.email = email
        await newUser.hashPassword(password)

        const user: any = await User.create({ username: newUser.username, email: newUser.email, password: newUser.password })

        const token: string = newUser.createToken(newUser.username, user.role, user._id, user.plan)
        res.status(201).json({
            token,
            success: true,
            username,
            plain: user.palin
        })
    } catch (err: any) {
        next(err)
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { password, email } = req.body;
        const newUser = new UserHelper();
        const user: any = await newUser.checkUser(email)
        newUser.email = email

        await newUser.comparePassword(user.password, password)

        const token: string = newUser.createToken(user.username, user.role, user._id, user.plan)
        res.status(201).json({
            token,
            success: true,
            username: user.username,
            plain: user.plain
        })
    } catch (err) {
        next(err)
    }
}

export async function createCode(req: Request, res: Response, next: NextFunction) {
    try {
        const { email } = req.body
        const newUser = new UserHelper();
        const user: any = await newUser.checkUser(email)
        const token = crypto.randomBytes(32).toString("hex");
        await sentForgetEmail(token, email, user.username)
        await Token.create({ token, userId: user._id })
        res.status(201).json()
    } catch (err) {
        next(err)
    }
}

export async function checkCode(req: Request, res: Response, next: NextFunction) {
    try {
        const token = (req.query.token as string) || ""
        const userId: string = await getCode(token)
        res.status(204).json()
    } catch (err) {
        next(err)
    }
}

export async function updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const token = (req.query.token as string) || ""
        const password: string = req.body.password
        const userId: string = await getCode(token)
        const objectId: Types.ObjectId = new Types.ObjectId(userId);
        const newUser = new UserHelper()

        await newUser.updateUserData({ password, _id: objectId })
        res.status(200).json()
    } catch (err) {
        next(err)
    }
}
