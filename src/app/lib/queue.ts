import IORedis from "ioredis";
import { envVars } from "../config/env";

const canUseQueue = envVars.REDIS_ENABLED && Boolean(envVars.REDIS_URL);

export const queueConnection = canUseQueue
    ? new IORedis(envVars.REDIS_URL as string, {
        lazyConnect: true,
        maxRetriesPerRequest: null
    })
    : null;

if (queueConnection) {
    queueConnection.on("error", (error: Error) => {
        console.error("Queue Redis error:", error.message);
    });

    queueConnection.on("reconnecting", () => {
        console.warn("Queue Redis reconnecting...");
    });
}
