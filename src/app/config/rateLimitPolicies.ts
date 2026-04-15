import { Request } from "express";
import { envVars } from "./env";
import { createRateLimiter } from "../middlewares/rateLimiter";

const getNormalizedEmail = (req: Request): string | null => {
    const email = req.body?.email;

    if (typeof email !== "string") {
        return null;
    }

    const normalizedEmail = email.trim().toLowerCase();

    return normalizedEmail.length > 0 ? normalizedEmail : null;
};

export const loginRateLimiter = createRateLimiter({
    keyPrefix: "login",
    windowSeconds: envVars.LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    maxRequests: envVars.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
    resolveKey: (req, context) => {
        const email = getNormalizedEmail(req);

        if (!email) {
            return context.ip;
        }

        return `${context.ip}:${email}`;
    }
});

export const createBookingRateLimiter = createRateLimiter({
    keyPrefix: "create-booking",
    windowSeconds: envVars.BOOKING_RATE_LIMIT_WINDOW_SECONDS,
    maxRequests: envVars.BOOKING_RATE_LIMIT_MAX_REQUESTS,
    resolveKey: (req, context) => `${req.user.userId}:${context.ip}`
});
