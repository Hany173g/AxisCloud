import cron from "node-cron";
import { Monitor } from "../models/monitor.model.js";
import { checkUrl } from "../utils/check-urls.util.js"

export async function checkCurrentMonitors() {
    try {
        cron.schedule('*/10 * * * * *', async () => {
            const date = Date.now()
            const data = await Monitor.find({ checkAt: { $lt: date }, isActive: true })
            const ids = data.map(d => d._id)
            const free = (10 * 1000 * 60)
            const pro = (3 * 1000 * 60)
            const business = (1 * 1000 * 60)
            await Monitor.updateMany(
                { _id: { $in: ids } },
                [
                    {
                        $set: {
                            checkAt: {
                                $switch: {
                                    branches: [
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
            )
            await checkUrl(data)
        })
    } catch (err) {
        console.log(err)
    }
}
