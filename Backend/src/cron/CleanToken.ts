import cron from "node-cron";
import {Token} from "../models/Token.js";

export function CleanToken() {
  cron.schedule("*/1 * * * *", async () => {
    const fiveMinutes = 1000 * 60 * 5;
    await Token.deleteMany({createdAt:{ $lt: new Date(Date.now() - fiveMinutes)}})
   
  });
}
  