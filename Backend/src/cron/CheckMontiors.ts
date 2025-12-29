import cron from "node-cron";
import {Montior} from "../models/Montior.js";
import {FreePlan} from "../utils/Plans.js"
import {CheckUrl} from "../utils/CheckUrls.js"
export async function CheckCurrentMontiors() {
 
  cron.schedule('*/1 * * * * *', async () => {
    let date = Date.now()
    let data = await Montior.find({checkAt:{$lt:date}})
    console.log(data)
    console.log(date)
    let ids = data.map(d => d._id)
    let free = (10 * 1000 * 60) 
    let pro = (3 * 1000 * 60) 
    let business = (1 * 1000 * 60) 
    await Montior.updateMany(
      {_id:{$in: ids}},
      [
        {
          $set: {
            checkAt:{
              $switch:{
                branches:[
                  { case: { $eq: ["$plan", "pro"] }, then: { $add: ["$checkAt", pro] } },
                  { case: { $eq: ["$plan", "free"] }, then: { $add: ["$checkAt", free] } },
                  { case: { $eq: ["$plan", "business"] }, then: { $add: ["$checkAt", business] } }
                ],
                default: "$checkAt"
              }
            }
          }
        }
      ],
       { updatePipeline: true } 
    )
      await CheckUrl(data)
  })
 
}
