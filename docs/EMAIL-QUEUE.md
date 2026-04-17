# Email Queue (BullMQ + Resend)

## Purpose
We use a Redis-backed BullMQ queue to decouple email sending from the payment webhook flow, so payment confirmation stays fast and reliable while booking confirmation emails are processed asynchronously.

## Implementation Files
- `src/app/config/env.ts`
  - Reads queue/email config:
    - `EMAIL_QUEUE_CONCURRENCY` (default `5`)
    - `EMAIL_QUEUE_ATTEMPTS` (default `5`)
    - `EMAIL_QUEUE_BACKOFF_MS` (default `3000`)
    - `RESEND_API_KEY`
    - `EMAIL_FROM`
    - `EMAIL_REPLY_TO`
- `src/app/lib/queue.ts`
  - Creates shared BullMQ Redis connection using `REDIS_URL`
  - Handles reconnect/error events
- `src/app/queues/email.queue.ts`
  - Creates `email-jobs` queue
  - Exposes `enqueueBookingConfirmationEmail(...)`
  - Uses idempotent job ID format: `booking-confirmation-${uniqueId}`
- `src/app/workers/email.worker.ts`
  - Runs BullMQ worker process
  - Consumes `booking-confirmation-email` jobs
  - Calls notification service and logs completion/failure
- `src/app/lib/resend.ts`
  - Initializes Resend client
- `src/app/utils/email.ts`
  - Sends email via Resend with validation/error handling
- `src/app/modules/payment/payment.email.ts`
  - Booking confirmation email template builder
- `src/app/modules/payment/payment.notification.ts`
  - Fetches booking details and sends confirmation email
- `src/app/modules/payment/payment.service.ts`
  - Enqueues booking confirmation email job after successful Stripe checkout webhook

## Queue Trigger
- Stripe Webhook
  - `POST /api/v1/payments/webhook`
  - On `checkout.session.completed`:
    - Updates payment/booking payment status
    - Enqueues `booking-confirmation-email` job

## Queue Strategy
- Queue name: `email-jobs`
- Job name: `booking-confirmation-email`
- Job payload:
  - `bookingId`
- Retry policy:
  - Attempts: `EMAIL_QUEUE_ATTEMPTS` (default `5`)
  - Backoff: exponential with `EMAIL_QUEUE_BACKOFF_MS` (default `3000`)
- Cleanup policy:
  - Remove completed jobs after 24h (max 1000 kept)
  - Remove failed jobs after 7 days

## Current Strategy Notes
- Webhook uses queue enqueue instead of direct email sending to avoid blocking Stripe webhook completion.
- Queue enqueue failures are logged so webhook can still respond and avoid retry storms.
- Worker fetches latest booking/user/vendor/employee data before sending, ensuring email content reflects persisted state.
- BullMQ + Redis enables retries and transient failure recovery.

## Tradeoffs
- Adds infrastructure complexity (separate worker service) compared to direct synchronous send.
- Requires Redis health and worker uptime to deliver emails promptly.
- Queue processing is eventually consistent, not immediate inline with webhook.

## Known Risks
- Wrong `DATABASE_URL` on worker prevents job processing (Prisma read fails).
- Wrong `EMAIL_FROM` (non-verified sender) causes Resend rejection.
- Redis eviction policies other than `noeviction` can impact queue reliability under memory pressure.

## Deployment Model
- API runs on Vercel.
- Email worker runs as a separate always-on process (e.g., Railway/Render) using:
  - `pnpm worker:email`
- API and worker must point to the same Redis instance.

## Next Improvement
- Add dead-letter queue and alerting for repeatedly failed email jobs.

## Environment Variables
- `REDIS_URL` (required for queue connection)
- `REDIS_ENABLED` (`true/false`, defaults to `true`)
- `RESEND_API_KEY` (required for email sending)
- `EMAIL_FROM` (must use verified domain sender in Resend)
- `EMAIL_REPLY_TO` (optional)
- `EMAIL_QUEUE_CONCURRENCY` (default `5`)
- `EMAIL_QUEUE_ATTEMPTS` (default `5`)
- `EMAIL_QUEUE_BACKOFF_MS` (default `3000`)

## Quick Verification
1. Create a new booking and complete payment successfully.
2. Confirm Vercel webhook logs show enqueue success.
3. Confirm worker logs show job completion (`Email job completed: ...`).
4. Confirm recipient receives booking confirmation email.
