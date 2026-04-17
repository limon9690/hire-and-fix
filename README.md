# Hire & Fix Backend

Role-based backend API for a home-services booking platform where users book service employees managed by vendors.

## Live API
https://hire-and-fix-backend.vercel.app

## Live Links
- Frontend: https://hire-and-fix-frontend.vercel.app
- Swagger UI: https://hire-and-fix-backend.vercel.app/docs/

## What This Project Covers
- JWT auth with role-based access (`ADMIN`, `VENDOR`, `EMPLOYEE`, `USER`)
- Vendor-managed employees and service categories
- Booking lifecycle with role-specific status transitions
- Review system for completed bookings
- Admin dashboards and platform management endpoints
- Stripe Checkout integration with webhook-based payment confirmation
- Redis response caching with TTL-based invalidation on write operations
- Redis-backed rate limiting on auth and booking endpoints
- Async booking confirmation emails via BullMQ job queue and Resend

## Tech Stack
- Node.js, Express, TypeScript
- Prisma + PostgreSQL
- Zod validation
- Cookie-based JWT auth
- Stripe (Checkout + Webhooks)
- Redis + ioredis — response caching and rate limiting
- BullMQ — Redis-backed job queue for async processing
- Resend — transactional email delivery

## Infrastructure & Performance

- **Response Caching** — Cache-aside pattern via Redis on shared GET endpoints (vendors, employees, service categories). TTL-based with prefix invalidation on writes. Graceful degradation if Redis is unavailable. → [details](docs/CACHING.md)
- **Rate Limiting** — Fixed-window Redis-backed limiting on auth and booking endpoints. Policy-based design with per-route thresholds and key strategies. Returns 429 with `Retry-After`. → [details](docs/RATE-LIMITING.md)
- **Email Queue** — BullMQ-backed async email processing via Resend. Booking confirmation emails are decoupled from the Stripe webhook handler using a Redis-backed job queue with exponential backoff retry. Worker runs as a separate persistent process. → [details](docs/EMAIL-QUEUE.md)

## Quick Start
```bash
pnpm install
pnpm generate
pnpm migrate
pnpm dev
```

Server:
- `http://localhost:5000`
- API base: `http://localhost:5000/api/v1`

## Required Environment Variables
Use [.env.example](.env.example) as the single source of truth for all required variables and example values.

## API Overview

### Auth
`/api/v1/auth`
- register/login/logout
- role-specific registration (`user`, `vendor`, employee creation by vendor)
- `GET /me` for current profile

### Vendor / Employee / Category
- vendor listing, details, self-update, dashboard summary
- employee listing/details, vendor-managed CRUD, employee self-update
- service category CRUD (admin for write operations)

### Booking
`/api/v1/bookings`
- user creates booking
- user/vendor/employee get their own bookings
- role-based booking status updates
- cancellation rules and validation in service layer

### Review
`/api/v1/reviews`
- user can review completed booking once
- public employee review listing with average rating
- review update by owner

### Payment (Stripe)
`/api/v1/payments`
- `POST /checkout-session/:bookingId` creates Stripe Checkout session
- webhook endpoint confirms payment and updates DB state

### Admin
`/api/v1/admin`
- dashboard summary
- users list/details/status update
- vendor approval
- platform-wide bookings and payments views

## Pagination and Sorting
Applied to list endpoints with a shared helper.

Supported query pattern:
- `page`, `limit`
- `sortBy`, `sortOrder`
- endpoint-specific filters (where applicable)

Response includes:
- `data`
- `meta` (`page`, `limit`, `total`, `totalPages`)

## Stripe Webhook (Local)
```bash
stripe login
stripe listen --forward-to localhost:5000/api/v1/payments/webhook
```

Use the generated `whsec_...` as `STRIPE_WEBHOOK_SECRET`.

## Scripts
- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm migrate`
- `pnpm generate`
- `pnpm studio`
- `pnpm lint`
- `pnpm lint:fix`
- `pnpm format`

## Documentation
- API Docs (Swagger UI): `http://localhost:5000/docs`
- API Base (Production): `https://hire-and-fix-backend.vercel.app`
- OpenAPI Spec: [docs/openapi.yaml](docs/openapi.yaml)
- [Architecture Overview](docs/architecture.md)
- [Redis Caching](docs/CACHING.md)
- [Rate Limiting](docs/RATE-LIMITING.md)
- [Email Queue](docs/EMAIL-QUEUE.md)

## Notes
- Admin seeding runs on server startup (if admin does not exist).
- Global error handling and zod validation are applied across modules.
