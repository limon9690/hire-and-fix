import { NextFunction, Request, Response } from "express";
import { getCache, setCache } from "../utils/cache";

export const cacheResponse = (ttlSeconds: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== "GET") {
            next();
            return;
        }

        const cacheKey = `cache:${req.originalUrl}`;
        const cachedResponse = await getCache<unknown>(cacheKey);

        if (cachedResponse) {
            res.setHeader("X-Cache", "HIT");
            res.status(200).json(cachedResponse);
            return;
        }

        const originalJson = res.json.bind(res);

        res.json = (body: unknown) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                void setCache(cacheKey, body, ttlSeconds);
                res.setHeader("X-Cache", "MISS");
            }

            return originalJson(body);
        };

        next();
    };
};
