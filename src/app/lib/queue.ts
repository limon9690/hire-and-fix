import IORedis from "ioredis";
import { envVars } from "../config/env";

const canUseQueue = envVars.REDIS_ENABLED && Boolean(envVars.REDIS_URL);

export const queueConnection = canUseQueue
    ? new IORedis(envVars.REDIS_URL as string, {
        maxRetriesPerRequest: null
    })
    : null;
