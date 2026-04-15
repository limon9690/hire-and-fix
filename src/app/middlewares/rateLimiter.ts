import status from "http-status";
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { redis } from "../lib/redis";

type TRateLimitContext = {
    ip: string;
    path: string;
};

type TRateLimitOptions = {
    keyPrefix: string;
    windowSeconds: number;
    maxRequests: number;
    resolveKey: (req: Request, context: TRateLimitContext) => string;
};

const sanitizeKeyPart = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, "");

const getClientIp = (req: Request): string => {
    const forwardedFor = req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
        return forwardedFor.split(",")[0]?.trim() || req.ip || "unknown";
    }

    return req.ip || "unknown";
};

export const createRateLimiter = ({
    keyPrefix,
    windowSeconds,
    maxRequests,
    resolveKey
}: TRateLimitOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!redis) {
            next();
            return;
        }

        try {
            const context: TRateLimitContext = {
                ip: sanitizeKeyPart(getClientIp(req)),
                path: req.originalUrl
            };

            const subjectKey = sanitizeKeyPart(resolveKey(req, context));
            const key = `rate-limit:${keyPrefix}:${subjectKey}`;

            const currentRequests = await redis.incr(key);

            if (currentRequests === 1) {
                await redis.expire(key, windowSeconds);
            }

            const ttlSeconds = await redis.ttl(key);
            const retryAfterSeconds = ttlSeconds > 0 ? ttlSeconds : windowSeconds;

            res.setHeader("X-RateLimit-Limit", String(maxRequests));
            res.setHeader("X-RateLimit-Remaining", String(Math.max(maxRequests - currentRequests, 0)));
            res.setHeader("X-RateLimit-Reset", String(retryAfterSeconds));

            if (currentRequests > maxRequests) {
                res.setHeader("Retry-After", String(retryAfterSeconds));
                throw new AppError(status.TOO_MANY_REQUESTS, "Too many requests. Please try again later.");
            }

            next();
        } catch (error) {
            if (error instanceof AppError) {
                next(error);
                return;
            }

            console.warn("Rate limiter error:", error);
            next();
        }
    };
};
