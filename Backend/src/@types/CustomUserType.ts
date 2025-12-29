











export interface UserType {
    _id?:string
    username?: string,
    password?:string,
    email?:string,
    role?: string,
    
}


export interface UserTypeWithPlan extends UserType {
    plan?:string
}
