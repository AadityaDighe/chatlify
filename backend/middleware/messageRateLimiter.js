import rateLimit from "express-rate-limit";

export const messageRateLimiter = rateLimit({
    windowMs: 10 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many messages. Slow down.",
        });
    },
});
