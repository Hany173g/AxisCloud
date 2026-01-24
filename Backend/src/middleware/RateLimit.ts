








import rateLimit from "express-rate-limit";



export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  max: 100
});

