# Redis Caching

## Purpose
We use Redis caching to reduce repeated database reads on high-traffic GET endpoints while keeping write behavior simple and safe for MVP.

## Implementation Files
- `src/app/config/env.ts`
  - Reads `REDIS_URL` and `REDIS_ENABLED`
- `src/app/lib/redis.ts`
  - Creates `ioredis` client (URL-based, Redis Cloud-friendly)
  - Exposes `redis` and `isRedisEnabled`
- `src/app/utils/cache.ts`
  - `getCache`, `setCache`, `deleteCache`, `deleteByPrefix`
- `src/app/middlewares/cache.ts`
  - `cacheResponse(ttlSeconds)` middleware
  - Cache key format: `cache:${req.originalUrl}`
  - Sets response header: `X-Cache: HIT | MISS`

## Cached Endpoints
- Service Category
  - `GET /api/v1/service-categories` → `cacheResponse(3600)`
- Vendor
  - `GET /api/v1/vendors` → `cacheResponse(300)`
  - `GET /api/v1/vendors/:id` → `cacheResponse(300)`
- Employee
  - `GET /api/v1/employees` → `cacheResponse(300)`
  - `GET /api/v1/employees/:id` → `cacheResponse(300)`

## Invalidation Strategy
We use prefix invalidation after successful write operations to clear list/detail/query variants at once.

- Service Categories
  - Prefix: `cache:/api/v1/service-categories`
  - Triggered after create, update, delete
  - File: `src/app/modules/serviceCategory/serviceCategory.service.ts`

- Vendors
  - Prefix: `cache:/api/v1/vendors`
  - Triggered after vendor self-profile update
    - `src/app/modules/vendor/vendor.service.ts`
  - Triggered after admin vendor approval update
    - `src/app/modules/admin/admin.service.ts`

- Employees
  - Prefix: `cache:/api/v1/employees`
  - Triggered after employee create
    - `src/app/modules/auth/auth.service.ts`
  - Triggered after vendor updates/deletes employee and employee self-update
    - `src/app/modules/employee/employee.service.ts`
  - Triggered after admin updates employee active status
    - `src/app/modules/admin/admin.service.ts`

## Current Strategy Notes
- We cache only selected GET routes with predictable shared responses.
- We intentionally avoid caching user-specific authenticated list endpoints like `GET /api/v1/employees/my` with current key logic, to avoid cross-user cache leakage.
- Cache invalidation is best-effort (wrapped in `try/catch`) and does not block core writes if Redis fails.
- If Redis is unavailable, API functionality still works normally (cache layer is optional).

## Tradeoffs
- Prefix invalidation is simple and reliable for MVP, but can evict more keys than strictly necessary.
- URL-only cache keys keep implementation straightforward, but are safe only for shared/public GET responses.
- TTL-based caching improves performance, but accepts a small temporary staleness window.

## Known Risks
- Data may remain stale until TTL expires if no write-triggered invalidation occurs.
- Concurrent cache misses can briefly create repeated DB hits (cache stampede risk).
- Broad prefix invalidation can reduce cache hit rate right after writes.

## Next Improvement
- Add user-aware cache keys for authenticated endpoints, e.g. `cache:${userId}:${req.originalUrl}` (with fallback for anonymous requests).

## Environment Variables
- `REDIS_URL` (required to connect)
- `REDIS_ENABLED` (`true/false`, defaults to `true` in code if not provided)

## Quick Verification
1. First GET request returns `X-Cache: MISS`.
2. Repeating same GET URL returns `X-Cache: HIT`.
3. Perform related write (create/update/delete), then GET again returns `MISS`.
