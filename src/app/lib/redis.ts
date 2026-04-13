import Redis from "ioredis";
import { envVars } from "../config/env";

const canConnectRedis = envVars.REDIS_ENABLED && Boolean(envVars.REDIS_URL);

export const isRedisEnabled = canConnectRedis;

export const redis = canConnectRedis
    ? new Redis(envVars.REDIS_URL as string, {
        lazyConnect: true,
        maxRetriesPerRequest: null
    })
    : null;

if (redis) {
    redis.on("connect", () => {
        console.log("Redis connecting...");
    });

    redis.on("ready", () => {
        console.log("Redis ready");
    });

    redis.on("error", (error: Error) => {
        console.error("Redis error:", error.message);
    });

    redis.on("reconnecting", () => {
        console.warn("Redis reconnecting...");
    });
}
