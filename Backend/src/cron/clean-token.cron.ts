import cron from "node-cron";
import { Token } from "../models/token.model.js";

export function cleanToken() {
  cron.schedule("*/10 * * * *", async () => {
    const fiveMinutes = 1000 * 60 * 5;
    await Token.deleteMany({ createdAt: { $lt: new Date(Date.now() - fiveMinutes) } })
  });
}
