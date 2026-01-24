


import {Types} from "mongoose"








export interface UserType {
    _id:Types.ObjectId
    username?: string,
    password?:string,
    email?:string,
    role?: string,
    
}


export interface UserTypeWithPlan extends UserType {
    plan?:string,

}
