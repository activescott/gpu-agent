# Plan: Excluded Listings Search, Bulk Sale Reason & Internal Auth

## Context

The `/internal/excluded-listings` page currently shows already-excluded listings but has no way to **search active listings** to find and exclude new ones. Bulk sale listings (multiple GPUs in one listing, e.g., "8x RTX 5090") skew pricing data but can't be auto-detected — the eBay Browse API search endpoint doesn't return `lotSize`, `quantity`, or `estimatedAvailabilities` (those require the `getItem` endpoint which we don't use). Title pattern matching was considered but rejected due to false positives (e.g., "8x" PCI bus speeds). So the `BULK_SALE` reason will be manual-only, used via the new search UI. Finally, the `/internal/` pages are publicly accessible and need simple authentication.

## 1. HTTP Basic Auth for `/internal/` Pages

**Create** `packages/web-app/src/middleware.ts`

- Use Next.js middleware with `matcher: ["/internal/:path*"]` to cover all internal pages and API routes
- Check for `Authorization: Basic <base64>` header
- Decode and compare against `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars
- If missing/invalid, return 401 with `WWW-Authenticate: Basic realm="Internal"` header (triggers browser's native login dialog)
- If env vars are not set, skip auth (allows dev without config)

**Update env templates:**
- `k8s/overlays/dev/.env.dev.app.example` — add `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- `packages/web-app/.env.local.template` — add `ADMIN_USERNAME` and `ADMIN_PASSWORD`

## 2. Add `BULK_SALE` Exclude Reason

**Edit** `packages/web-app/src/pkgs/isomorphic/model/listing.ts`
- Add `BULK_SALE: "bulk_sale"` to `EXCLUDE_REASONS` (manual-only — no automatic detection)

## 3. Search Active Listings & Manual Exclusion UI

### 3a. New repository function: Search active listings

**Edit** `packages/web-app/src/pkgs/server/db/ListingRepository.ts`
- Add `searchActiveListings(query: string, options: { limit, offset })` function
- Uses Prisma `contains` with `mode: 'insensitive'` on `title` field
- Filters `archived: false, exclude: false`
- Includes `gpu` relation
- Returns `{ listings: CachedListing[], total: number }`

### 3b. New API endpoint: Search active listings

**Create** `packages/web-app/src/app/internal/api/search-listings/route.ts`
- `GET /internal/api/search-listings?q=<query>&limit=50&offset=0`
- Calls `searchActiveListings()` from ListingRepository
- Returns `{ listings, total, pagination }` in same format as excluded-listings endpoint
- Protected by middleware auth (inherits from `/internal/` matcher)

### 3c. New API endpoint: Exclude a listing

**Create** `packages/web-app/src/app/internal/api/exclude-listing/route.ts`
- `POST /internal/api/exclude-listing` with body `{ itemId: string, reason: ExcludeReason }`
- Validate `reason` is a valid `ExcludeReason` value
- Call existing `excludeListingForDataQuality(itemId, reason)` from `ListingRepository.ts:939`
- Return success/error JSON

### 3d. Update excluded-listings page UI

**Edit** `packages/web-app/src/app/internal/excluded-listings/page.tsx`

Add a search section at the top of the page (above the existing excluded listings):
- Text input + search button in a card
- Results table showing matching active listings (title, GPU, price, condition, seller, eBay link)
- Each row has an "Exclude" button with a reason dropdown (all `EXCLUDE_REASONS` values, default to `BULK_SALE`)
- On confirm, POST to `/internal/api/exclude-listing`, then refresh both search results and excluded listings data
- Search results card is visually distinct from excluded listings below (different header, e.g., "Search Active Listings")

## Files to Create/Modify

| File | Action |
|------|--------|
| `packages/web-app/src/middleware.ts` | **Create** — Basic Auth middleware |
| `packages/web-app/src/pkgs/isomorphic/model/listing.ts` | **Edit** — Add `BULK_SALE` reason |
| `packages/web-app/src/pkgs/server/db/ListingRepository.ts` | **Edit** — Add `searchActiveListings()` |
| `packages/web-app/src/app/internal/api/search-listings/route.ts` | **Create** — Search API |
| `packages/web-app/src/app/internal/api/exclude-listing/route.ts` | **Create** — Exclude API |
| `packages/web-app/src/app/internal/excluded-listings/page.tsx` | **Edit** — Add search UI |
| `k8s/overlays/dev/.env.dev.app.example` | **Edit** — Add admin env vars |
| `packages/web-app/.env.local.template` | **Edit** — Add admin env vars |

## Existing Code to Reuse

- `excludeListingForDataQuality()` at `ListingRepository.ts:939` — marks listing as excluded
- `EXCLUDE_REASONS` at `listing.ts:88` — enum of exclusion reasons
- `listExcludedListings()` at `ListingRepository.ts:965` — pattern for paginated listing queries
- `parsePrismaListingWithGpu()` — converts Prisma results to `CachedListing`
- `createLogger()` — consistent logging across API routes

## Future: Automatic Bulk Sale Detection via eBay getItem API

The eBay Browse API **search** endpoint (`/buy/browse/v1/item_summary/search`) does not return quantity or lot-size fields. The only multi-item indicator it returns is `itemGroupType: "SELLER_DEFINED_VARIATIONS"` (already handled). Fields like `lotSize`, `estimatedAvailabilities` (which includes `estimatedAvailableQuantity`), and `quantityLimitPerBuyer` are only available from the **getItem** endpoint (`/buy/browse/v1/item/{itemId}`).

To auto-detect bulk sales in the future:
1. Implement a `getItem()` method in `packages/ebay-client/src/buy/buy.ts` (currently only `search()` exists)
2. Call it for each listing during cache revalidation to fetch `lotSize` and `estimatedAvailabilities[].estimatedAvailableQuantity`
3. Add `lotSize` and/or `estimatedAvailableQuantity` columns to the `Listing` model in `schema.prisma`
4. Filter on `lotSize > 0` or high `estimatedAvailableQuantity` in `listingFilters.ts`

Trade-off: This would multiply API calls significantly (~50 getItem calls per GPU during each revalidation cycle). Rate limiting and caching would need consideration.

Investigated listing `v1|127255548636|0` ("8x NVIDIA GEFORCE RTX 5090 32GB Founders Edition") — confirmed it has no `itemGroupType` set, so eBay doesn't flag it as a variation bundle. The seller simply didn't categorize it as a multi-quantity listing. Title pattern matching (e.g., "8x") was rejected due to false positives with PCI bus/speed references common in GPU listings.

## Verification

1. **Auth**: Start dev env, navigate to `http://localhost:3000/internal/excluded-listings` — should see browser login prompt. Wrong credentials return 401. Correct credentials load the page. API routes at `/internal/api/*` also require auth.
2. **Search**: On the excluded-listings page, type a search query (e.g., "5090"), see matching active listings.
3. **Manual exclude**: Click "Exclude" on a search result, select "bulk_sale" reason, confirm it disappears from search results and appears in the excluded list below.
4. **E2E**: Run `./scripts/test-e2e` to ensure no regressions.
