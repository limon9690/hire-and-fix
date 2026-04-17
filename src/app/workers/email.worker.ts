import { Job, Worker } from "bullmq";
import { envVars } from "../config/env";
import { queueConnection } from "../lib/queue";
import { EmailQueueConfig, TBookingConfirmationEmailJobPayload } from "../queues/email.queue";
import { sendBookingConfirmationEmail } from "../modules/payment/payment.notification";

if (!queueConnection) {
    throw new Error("Email worker requires REDIS_ENABLED=true and REDIS_URL to be configured");
}

const emailWorker = new Worker(
    EmailQueueConfig.EMAIL_QUEUE_NAME,
    async (job: Job<TBookingConfirmationEmailJobPayload>) => {
        if (job.name !== EmailQueueConfig.BOOKING_CONFIRMATION_EMAIL_JOB) {
            return;
        }

        await sendBookingConfirmationEmail(job.data.bookingId);
    },
    {
        connection: queueConnection,
        concurrency: envVars.EMAIL_QUEUE_CONCURRENCY
    }
);

emailWorker.on("ready", () => {
    console.log("Email worker is ready");
});

emailWorker.on("completed", (job) => {
    console.log(`Email job completed: ${job.id}`);
});

emailWorker.on("failed", (job, error) => {
    console.error(`Email job failed: ${job?.id}`, error.message);
});

emailWorker.on("error", (error) => {
    console.error("Email worker error:", error.message);
});
