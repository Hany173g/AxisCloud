


 import type {Request,Response,NextFunction} from "express"

import {AppError} from "../utils/ErrorHandling.js"

import {MontiorHelper} from "../utils/MontiorClass.js"
import type {RequestUser} from "../@types/CustomRequest.js"
import {CheckIsUser} from "../utils/CheckUser.js"

import {UserHelper} from "../utils/UserClass.js"



// async function checkWebsite(url: string) {
//     try {
//         // 1. Setup timeout
//         const controller = new AbortController();
//         const timeout = setTimeout(() => controller.abort(), 5000); // 5 ثواني

//         // 2. Send GET request
//         const response = await fetch(url, { method: 'GET', signal: controller.signal });
    
//         clearTimeout(timeout);

//         // 3. Check status
//         if (response.ok) {
//             return { url, status: "Up", code: response.status };
//         } else {
//             return { url, status: "Down", code: response.status };
//         }
//     } catch (err : any) {
//         return { url, status: "Down", code: 0, error: err.message };
//     }
// }



// export async function SendRequest(req : Request,res: Response, next : NextFunction) {   
//     try {
//         const {url} = req.body
//         let reqU = req as RequestUser
//         console.log(reqU.user)
//         let data = await checkWebsite(url)
//     res.status(200).json(data)
//     }catch(err)
//     {
//         next(err)
//     }

// }



export async function CreateMontior(req : Request,res: Response, next : NextFunction)
{
    try{
        let reqU = req as RequestUser
        CheckIsUser(reqU?.user)
        const {url,method,requestTime,checkInterval,headers} = req.body
        
        let newMontior = new MontiorHelper()
        let newUser = new UserHelper()
        let id = reqU.user?._id ?? ""
        let userData =   await newUser.GetUserById(id)
     
        newMontior.url = url
        newMontior.method = method
        newMontior.requestTime = requestTime
        newMontior.checkInterval = checkInterval
        newMontior.headers = headers
        console.log(newMontior.headers)
        await  newMontior.CheckPlan((userData))
        newMontior.CheckHeadersValue(newMontior.headers)
        let data = {url: newMontior.url,userId:userData._id,method:newMontior.method,requestTime:newMontior.requestTime,checkInterval:newMontior.checkInterval,headers:newMontior.headers}
        let checkAt : number  = Date.now()
         await newMontior.CreateMontior(data.url,data.userId,data.method,data.requestTime,data.checkInterval,data.headers,checkAt,userData.plan)
        res.status(200).json(newMontior)
    }catch(err)
    {
        console.log(err)
        next(err)
    }
}



