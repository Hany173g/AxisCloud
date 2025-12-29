

import type {Request} from "express"


import type {UserTypeWithPlan} from "./CustomUserType.js"







export interface RequestUser extends Request {
    user: UserTypeWithPlan | null
}


