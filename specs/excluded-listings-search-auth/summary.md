# Summary: Excluded Listings Search, Bulk Sale Reason & Internal Auth

## What was done

### 1. HTTP Basic Auth for `/internal/` Pages
- Created `packages/web-app/src/middleware.ts` with Next.js middleware
- Matcher covers `/internal/:path*` (all internal pages and API routes)
- Validates `Authorization: Basic <base64>` header against `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars
- Returns 401 with `WWW-Authenticate: Basic realm="Internal"` header when unauthenticated (triggers browser's native login dialog)
- Auth is skipped when env vars are not set (allows dev without config)

### 2. Added `BULK_SALE` Exclude Reason
- Added `BULK_SALE: "bulk_sale"` to `EXCLUDE_REASONS` in `listing.ts`
- Manual-only reason (no automatic detection) for bulk sale listings that skew pricing data

### 3. Search Active Listings & Manual Exclusion
- **Repository**: Added `searchActiveListings()` to `ListingRepository.ts` — case-insensitive title search on active (non-archived, non-excluded) listings with pagination
- **Search API**: Created `GET /internal/api/search-listings?q=<query>&limit=50&offset=0` endpoint
- **Exclude API**: Created `POST /internal/api/exclude-listing` with body `{ itemId, reason }` — validates reason against `EXCLUDE_REASONS` values
- **UI**: Updated `excluded-listings/page.tsx` with search section at top (warning-themed card), search results table with per-row reason dropdown + exclude button, auto-refresh of both search results and excluded listings after exclusion

### 4. Environment Templates
- Updated `k8s/overlays/dev/.env.dev.app.example` with `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Updated `packages/web-app/.env.local.template` with `ADMIN_USERNAME` and `ADMIN_PASSWORD`

### 5. E2E Tests
- Created `e2e-tests/tests/internal-auth.spec.ts` — tests 401 for unauthenticated/wrong creds, 200 for valid creds on both pages and APIs
- Updated `e2e-tests/tests/historical-data.spec.ts` — added Basic Auth headers to all requests

## Files Created
- `packages/web-app/src/middleware.ts`
- `packages/web-app/src/app/internal/api/search-listings/route.ts`
- `packages/web-app/src/app/internal/api/exclude-listing/route.ts`
- `e2e-tests/tests/internal-auth.spec.ts`

## Files Modified
- `packages/web-app/src/pkgs/isomorphic/model/listing.ts` — added BULK_SALE reason
- `packages/web-app/src/pkgs/server/db/ListingRepository.ts` — added searchActiveListings()
- `packages/web-app/src/app/internal/excluded-listings/page.tsx` — added search UI
- `k8s/overlays/dev/.env.dev.app.example` — added admin env vars
- `packages/web-app/.env.local.template` — added admin env vars
- `e2e-tests/tests/historical-data.spec.ts` — added auth credentials

## Verification Steps
1. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `k8s/overlays/dev/.env.dev.app`
2. Start dev env with `./scripts/dev`
3. Navigate to `http://localhost:3000/internal/excluded-listings` — should see browser login prompt
4. Search for listings, exclude with BULK_SALE reason
5. Run `./scripts/test-e2e` for full e2e suite
