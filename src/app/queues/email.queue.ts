import { JobsOptions, Queue } from "bullmq";
import { envVars } from "../config/env";
import { queueConnection } from "../lib/queue";

const EMAIL_QUEUE_NAME = "email-jobs";
const BOOKING_CONFIRMATION_EMAIL_JOB = "booking-confirmation-email";

type TBookingConfirmationEmailJobPayload = {
    bookingId: string;
};

const defaultJobOptions: JobsOptions = {
    attempts: envVars.EMAIL_QUEUE_ATTEMPTS,
    backoff: {
        type: "exponential",
        delay: envVars.EMAIL_QUEUE_BACKOFF_MS
    },
    removeOnComplete: {
        age: 60 * 60 * 24,
        count: 1000
    },
    removeOnFail: {
        age: 60 * 60 * 24 * 7
    }
};

export const emailQueue = queueConnection
    ? new Queue(EMAIL_QUEUE_NAME, {
        connection: queueConnection,
        defaultJobOptions
    })
    : null;

export const enqueueBookingConfirmationEmail = async (
    payload: TBookingConfirmationEmailJobPayload,
    uniqueId: string
): Promise<void> => {
    if (!emailQueue) {
        throw new Error("Email queue is not configured");
    }

    await emailQueue.add(BOOKING_CONFIRMATION_EMAIL_JOB, payload, {
        jobId: `booking-confirmation:${uniqueId}`
    });
};

export const EmailQueueConfig = {
    EMAIL_QUEUE_NAME,
    BOOKING_CONFIRMATION_EMAIL_JOB
};

export type { TBookingConfirmationEmailJobPayload };
