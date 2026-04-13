import { redis } from "../lib/redis";

export const getCache = async <T>(key: string): Promise<T | null> => {
    if (!redis) {
        return null;
    }

    const cachedValue = await redis.get(key);

    if (!cachedValue) {
        return null;
    }

    try {
        return JSON.parse(cachedValue) as T;
    } catch {
        return null;
    }
};

export const setCache = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
    if (!redis) {
        return;
    }

    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
};

export const deleteCache = async (key: string): Promise<void> => {
    if (!redis) {
        return;
    }

    await redis.del(key);
};

export const deleteByPrefix = async (prefix: string): Promise<void> => {
    if (!redis) {
        return;
    }

    const redisClient = redis;

    const stream = redisClient.scanStream({
        match: `${prefix}*`,
        count: 100
    });

    await new Promise<void>((resolve, reject) => {
        stream.on("data", async (keys: string[]) => {
            if (keys.length === 0) {
                return;
            }

            stream.pause();

            try {
                await redisClient.del(...keys);
                stream.resume();
            } catch (error) {
                reject(error);
            }
        });

        stream.on("end", () => resolve());
        stream.on("error", (error) => reject(error));
    });
};
