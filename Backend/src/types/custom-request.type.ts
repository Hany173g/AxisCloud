import type { Request } from "express"
import type { UserTypeWithPlan } from "./custom-user-type.type.js"

export interface RequestUser extends Request {
    user: UserTypeWithPlan | null
}
