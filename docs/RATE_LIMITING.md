# Rate Limiting

## Purpose
We use Redis-backed rate limiting to reduce brute-force and request-spam risk on sensitive write/auth endpoints while keeping the behavior simple and configurable for MVP.

## Implementation Files
- `src/app/config/env.ts`
  - Reads limiter config and defaults:
    - `LOGIN_RATE_LIMIT_WINDOW_SECONDS` (default `900`)
    - `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` (default `5`)
    - `BOOKING_RATE_LIMIT_WINDOW_SECONDS` (default `300`)
    - `BOOKING_RATE_LIMIT_MAX_REQUESTS` (default `10`)
    - `TRUST_PROXY` (default `true`)
- `src/app/middlewares/rateLimiter.ts`
  - Generic `createRateLimiter(...)` middleware factory
  - Uses Redis `INCR` + `EXPIRE` + `TTL`
  - Adds headers:
    - `X-RateLimit-Limit`
    - `X-RateLimit-Remaining`
    - `X-RateLimit-Reset`
    - `Retry-After` (when blocked)
- `src/app/config/rateLimitPolicies.ts`
  - Defines route-level policies:
    - `loginRateLimiter`
    - `createBookingRateLimiter`
- `src/app/modules/auth/auth.routes.ts`
  - Applies limiter to `POST /login`
- `src/app/modules/booking/booking.routes.ts`
  - Applies limiter to `POST /`
- `src/app.ts`
  - Enables `app.set("trust proxy", 1)` when `TRUST_PROXY=true`

## Protected Endpoints
- Auth
  - `POST /api/v1/auth/login`
  - Policy key: `ip + normalizedEmail`
  - Default policy: `5 requests / 900 seconds`
- Booking
  - `POST /api/v1/bookings`
  - Policy key: `userId + ip`
  - Default policy: `10 requests / 300 seconds`

## Current Strategy Notes
- We use policy-based middleware so each route can have different thresholds and key strategies.
- Redis is the shared store, so limits are consistent across multiple app instances.
- Limiter is fail-open on Redis failure (request proceeds, warning logged) to protect availability.
- Login limiter is mounted before validation to block repeated noisy attempts early.
- Booking limiter is mounted after auth so it can safely key by `userId`.

## Tradeoffs
- Fixed-window counters are simple and fast, but allow boundary bursts near window resets.
- `ip + email` for login helps limit brute-force attempts, but shared/NAT IPs can still affect fairness.
- Fail-open avoids production outages when Redis is down, but temporarily weakens protection.

## Known Risks
- If Redis is unavailable, requests are not blocked by limiter until Redis recovers.
- Incorrect proxy/IP setup can weaken key quality and produce uneven limiting.
- Very high-cardinality keys can increase Redis key churn under heavy attack traffic.

## Next Improvement
- Add dedicated lockout policy for repeated failed login attempts only (not all login attempts), with optional progressive backoff.

## Environment Variables
- `REDIS_URL` (required to connect)
- `REDIS_ENABLED` (`true/false`, defaults to `true` in code if not provided)
- `TRUST_PROXY` (`true/false`, defaults to `true`)
- `LOGIN_RATE_LIMIT_WINDOW_SECONDS` (default `900`)
- `LOGIN_RATE_LIMIT_MAX_ATTEMPTS` (default `5`)
- `BOOKING_RATE_LIMIT_WINDOW_SECONDS` (default `300`)
- `BOOKING_RATE_LIMIT_MAX_REQUESTS` (default `10`)

## Quick Verification
1. Call `POST /api/v1/auth/login` repeatedly with same email from same IP.
2. After limit is crossed, response should be `429` with `Retry-After`.
3. Call `POST /api/v1/bookings` repeatedly with same authenticated user/IP and confirm `429` after threshold.
4. Confirm limiter headers are present on responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
