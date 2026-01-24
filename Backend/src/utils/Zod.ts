import {z} from "zod"
import { AppError } from "./ErrorHandling.js"
import {Types} from "mongoose"


export function ZodValadtion(result : any) {
    if (!result.success) throw new AppError(400,result.error.issues[0].message)
    return result.data
}



export const updateMontiorSchema  = z.object({
    name: z.string({message:"name msut be string"}).min(2,"name must be at 2 length").max(12,"name must be at max 13 length").optional(),
    url : z.url({message: "this not a url"}).optional(),
    checkInterval: z.number({message: "this not a number"}).optional(),
    method : z.string({message:"method must be string"}).optional(),
    headers:z.object({message: "headers must be object"}).optional(),
    isActive: z.boolean({message:"isActive must be boolean"}).optional(),
    isAlerts: z.boolean({message:"isAlerts must be boolean"}).optional(),
    hooks: z
  .record(z.string(), z.string())
  .optional()
  .superRefine((hooks, ctx) => {
    if (!hooks) return;
    for (const [key, value] of Object.entries(hooks)) {
      try {
        new URL(value);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `hook "${key}" must be a valid url`,
          path: ["hooks", key],
        });
      }
    }
  })

})






export const deleteFeildSchema = z.object({
    hookName : z.string({message:"name must be string"}).min(2,"name must be at 2 length").max(10,"name msut be at max 10 length"),
})





export const updateFeildSchema = deleteFeildSchema.extend({
  hooks: z
  .record(
    z.string(),
    z.string().url({ message: "hook value must be valid url" })
  )
  .optional()
})


