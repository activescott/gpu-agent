# Plan: Amazon Listing Search Integration

## Context

GPU Poet currently only sources GPU listings from eBay. This plan integrates Amazon as a second listing source using the validated approach from `gpu-poet-data/research/amazon-price-scraping/`. Amazon searching uses Playwright (Firefox) with Oxylabs proxy and Cheerio HTML parsing.

Amazon listing data is stored in the same `Listing` table with a `source` field. All display/chart queries filter to `source='ebay'` so Amazon data never appears on the site until we explicitly remove those filters after validating reliability.

Key constraints:
- Amazon anti-bot: only search 1 GPU per revalidation run (conservative)
- 75 GPUs total, 6-hour cache TTL → need ~10-min CronJob interval
- Amazon failures must never break eBay revalidation (separate try/catch, non-fatal)
- No feature flag needed — if the amazon-searcher service is down, Amazon revalidation fails gracefully
- Amazon searcher runs as a **separate cluster-internal microservice** (no ingress, no auth)

---

## Step 1: Database Schema — Add `source` Field

**Files:**
- `packages/web-app/prisma/schema.prisma` — add `source String @default("ebay")` to Listing model, add index `[gpuName, source, archived, cachedAt]`
- New migration: `packages/web-app/prisma/migrations/YYYYMMDDHHMMSS_add_listing_source/migration.sql`

**Migration SQL:**
```sql
ALTER TABLE "Listing" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'ebay';
DROP INDEX IF EXISTS "one_active_per_item";
CREATE UNIQUE INDEX "one_active_per_item" ON "Listing"("itemId", "source") WHERE "archived" = false;
CREATE INDEX "Listing_gpuName_source_archived_cachedAt_idx" ON "Listing"("gpuName", "source", "archived", "cachedAt");
```

The unique index must include `source` because eBay itemIds and Amazon ASINs could theoretically collide. Using `String @default("ebay")` instead of a Prisma enum to avoid ALTER TYPE migrations.

---

## Step 2: New `packages/amazon-searcher` Microservice

A standalone HTTP microservice with Playwright/Firefox. Cluster-internal only (ClusterIP service, no ingress, no auth). The web-app calls it via `POST http://amazon-searcher:3001/search`.

### Package structure
```
packages/amazon-searcher/
  package.json          — deps: playwright, cheerio, express
  tsconfig.json
  tsconfig.es.json
  Dockerfile            — node:22-slim with playwright firefox
  vitest.config.ts
  src/
    index.ts            — HTTP server entrypoint (listen on port 3001)
    server.ts           — Express app: POST /search, GET /health
    types.ts            — AmazonSearchResult, AmazonSearchRequest
    scraper.ts          — Playwright browser automation
    parser.ts           — Cheerio HTML extraction
    proxy.ts            — Oxylabs proxy config builder
    user-agents.ts      — Firefox UA pool (7 agents from research)
    affiliate.ts        — Amazon affiliate URL generation
    parser.test.ts      — Parser tests with HTML fixtures
```

### HTTP API

```
POST /search
  Request:  { "searchQuery": "NVIDIA RTX 4070 Ti 16GB", "affiliateTag?": "gpu-poet-20" }
  Response: { "results": AmazonSearchResult[] }
  Error:    { "error": "description" } with HTTP 500

GET /health
  Response: { "status": "ok" }
```

### Key types (`types.ts`)
```typescript
interface AmazonSearchResult {
  asin: string
  title: string
  price: number | null
  mainImageUrl: string
  condition: string | null    // null from search = assume "New"
  brand: string | null
  reviewRating: number | null
  reviewCount: number | null
  isBulkDeal: boolean
  productUrl: string          // https://amazon.com/dp/{ASIN}
  affiliateUrl: string        // with ?tag= if configured, otherwise same as productUrl
}
```

### Scraper flow (`scraper.ts`)
1. Launch Firefox with Oxylabs proxy (`pr.oxylabs.io:7777`)
2. Random Firefox user-agent, `serviceWorkers: "block"`
3. Visit `amazon.com` homepage first (establish cookies, handle interstitial)
4. Random delay 5-15s
5. Navigate to search URL: `https://amazon.com/s?k={query with + spaces}&sprefix={lowercase}%2Caps%2C166`
6. Human-like scrolling to trigger lazy-loaded results
7. Extract HTML, parse with Cheerio, close browser in `finally` block

### Parser selectors (`parser.ts`) — from research
- Container: `[data-component-type="s-search-result"]`
- ASIN: `data-asin` attribute on container
- Title: `h2[aria-label]`
- Price: `[data-cy="price-recipe"] span[data-a-size]:not([data-a-strike="true"])`
- Image: `[data-cy="image-container"] img` or `img.s-image`
- Rating: `a[aria-label*="out of 5 stars"]`
- Review count: `a[aria-label$="ratings"]`
- Skip listings with no price (they require detail page)

### Affiliate link (`affiliate.ts`)
`https://amazon.com/dp/{ASIN}?tag={tag}` if affiliateTag provided, plain `https://amazon.com/dp/{ASIN}` otherwise.

### Dockerfile
Using `node:22-slim` (not Alpine) because Playwright Firefox needs glibc:
```dockerfile
# Stage 1: deps (node:22-slim, npm ci --production)
# Stage 2: builder (npm ci, tsc build)
# Stage 3: runner (node:22-slim + playwright firefox)
RUN npx playwright install --with-deps firefox
USER searcher (UID 1001)
CMD ["node", "dist/es/index.js"]
EXPOSE 3001
```

---

## Step 3: K8s Resources for Amazon Searcher

### `k8s/base/amazon-searcher-deployment.yaml`
- Deployment with 1 replica
- Container from `amazon-searcher-image-placeholder` on port 3001
- Env: `OXYLABS_USERNAME` and `OXYLABS_PASSWORD` from `app-creds` secret
- Resources: 0.5 CPU / 512Mi limit, 0.1 CPU / 256Mi request
- Readiness probe: `GET /health` on port 3001

### `k8s/base/amazon-searcher-service.yaml`
- ClusterIP service (no ingress) — only reachable within the cluster
- Port 3001 → targetPort 3001

### Updates to existing K8s files
- `k8s/base/kustomization.yaml` — add both new resources
- `k8s/overlays/dev/kustomization.yaml` — add image override for dev
- `skaffold.yaml` — add amazon-searcher as a second build artifact

---

## Step 4: Configuration

**File: `packages/web-app/src/pkgs/isomorphic/config.ts`**

Add to `SERVER_CONFIG`:
- `AMAZON_SEARCHER_URL` — default `http://amazon-searcher:3001`, override via env for dev/testing
- `AMAZON_AFFILIATE_TAG` — optional (`process.env.AMAZON_AFFILIATE_TAG`, no throw if missing)

No `AMAZON_SCRAPING_ENABLED` flag — Amazon revalidation always runs. If the searcher service is unreachable, it fails gracefully (non-fatal, logged, metrics recorded).

**File: `packages/web-app/src/pkgs/server/cacheConfig.ts`**

Improve the comment on `CACHED_LISTINGS_DURATION_MS`: "Staleness threshold for listing caches. Listings from any source (eBay, Amazon) older than this are refreshed on the next revalidation run."

**K8s env vars for web-app** (`k8s/base/app-deployment.yaml`):
- `AMAZON_SEARCHER_URL` — optional, defaults to `http://amazon-searcher:3001`
- `AMAZON_AFFILIATE_TAG` — optional secretKeyRef from `app-creds`

---

## Step 5: Listing Model — Amazon Conversion + Zod Schema

**File: `packages/web-app/src/pkgs/isomorphic/model/listing.ts`**

Add a **zod schema** to validate the amazon-searcher response in the web-app:
```typescript
import { z } from "zod"

const AmazonSearchResultSchema = z.object({
  asin: z.string(),
  title: z.string(),
  price: z.number().nullable(),
  mainImageUrl: z.string(),
  condition: z.string().nullable(),
  brand: z.string().nullable(),
  reviewRating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  isBulkDeal: z.boolean(),
  productUrl: z.string(),
  affiliateUrl: z.string(),
})
type AmazonSearchResult = z.infer<typeof AmazonSearchResultSchema>

const AmazonSearchResponseSchema = z.object({
  results: z.array(AmazonSearchResultSchema),
})
```

Add `convertAmazonResultToListing(result, gpu)` function that maps `AmazonSearchResult` → `Listing`:
- `itemId` = ASIN
- `sellerUsername` = "Amazon"
- `sellerFeedbackPercentage` = "100" (pass-through for feedback filter)
- `condition` = `result.condition ?? "New"` (null from search → assume New)
- `conditionId` = null (no eBay condition IDs)
- `buyingOptions` = ["FIXED_PRICE"]
- `itemAffiliateWebUrl` = result.affiliateUrl
- `listingMarketplaceId` = "AMAZON_US"
- Don't use `proxyImageUrl` (that's eBay-specific image proxy)

---

## Step 6: Source-Aware Listing Filters

**File: `packages/web-app/src/pkgs/server/listingFilters.ts`**

**Approach:** Each filter checks the listing source. If the filter doesn't support that source, it keeps the item (returns `true`). No need to compose different filter sets — just add all filters and each one self-selects.

Each existing filter gets a source check at the top:
- `sellerFeedbackFilter` — if source !== "ebay", return true (keep)
- `allListingFilters` (affiliate link, FIXED_PRICE, variations) — if source !== "ebay", return true
- `conditionFilter` — update to handle both sources:
  - eBay: existing logic (conditionId !== "7000")
  - Amazon: if condition is null, treat as "New" (keep). If condition contains "for parts" or similar, exclude.
- `createRequiredLabelFilter` — applies to all sources (no change)
- `createRequireMemoryKeywordFilter` — applies to all sources (no change)
- `gpuAccessoryFilter` — applies to all sources (no change)

This means `createFilterForGpu(gpu)` signature stays the same — no `source` parameter needed. Each filter determines source from a `source` field added to the `Listing` interface.

**Addition to `Listing` interface:** Add optional `source?: string` field so filters can check it. This field gets set when converting Amazon results.

---

## Step 7: Amazon Caching Logic

**New file: `packages/web-app/src/pkgs/server/listings/amazon.ts`**

`cacheAmazonListingsForGpu(gpuName, prisma)`:
1. Get GPU spec from DB
2. Call amazon-searcher service: `POST ${AMAZON_SEARCHER_URL}/search` with `{ searchQuery: gpu.label, affiliateTag }`
3. Validate response with `AmazonSearchResponseSchema.parse()`
4. Filter results with no price (skip them)
5. Convert to Listing objects via `convertAmazonResultToListing`
6. Apply filters via `createFilterForGpu(gpu)` (filters self-select based on source)
7. Call `addOrRefreshListingsForGpu(listings, gpuName, prisma, "amazon")`
8. Call `archiveStaleListingsForGpu(gpuName, prisma, "amazon")`

**File: `packages/web-app/src/pkgs/server/listings/listings.ts`**

Add `revalidateAmazonListings()`:
1. Find the single most-stale GPU for Amazon:
   - Query all GPUs, find the one whose Amazon listings have the oldest `cachedAt` (or no Amazon listings at all)
   - Only pick GPUs whose Amazon cache is older than `CACHED_LISTINGS_DURATION_MS`
2. If no GPU is stale, return early (nothing to refresh)
3. Call `cacheAmazonListingsForGpu()` for that one GPU
4. Return stats (gpuName, listing count, duration, success)

---

## Step 8: Repository Changes

**File: `packages/web-app/src/pkgs/server/db/ListingRepository.ts`**

### Write operations — add `source` parameter:
- `addOrRefreshListingsForGpu(listings, gpuName, prisma, source = "ebay")` — set `source` field when creating records; filter existing records by source when checking for changes
- `archiveStaleListingsForGpu(gpuName, prisma, source = "ebay")` — filter by `source` so eBay archival doesn't touch Amazon records and vice versa

### Read operations — filter Amazon OUT for now:
Add `source: "ebay"` WHERE clause to all display/chart queries:
- `listActiveListings()`
- `listActiveListingsForGpus()`
- `listActiveListingsGroupedByGpu()`
- `getPriceStats()` (raw SQL — add `AND "source" = 'ebay'`)
- `getHistoricalPriceData()` (raw SQL — add `AND "source" = 'ebay'`)
- `getMonthlyAverages()` (raw SQL — add `AND "source" = 'ebay'`)
- `getAvailabilityTrends()` (raw SQL — add `AND "source" = 'ebay'`)
- `getPriceVolatility()` (raw SQL — add `AND "source" = 'ebay'`)
- `getLatestListingDate()`
- `listingsByCostPerformanceBySlug()` (raw SQL — add `AND l."source" = 'ebay'`)

The `listCachedListingsGroupedByGpu()` function (used by revalidation) needs to accept a source filter so eBay revalidation only sees eBay listings and Amazon revalidation only sees Amazon listings.

When ready to show Amazon data, remove or parameterize these filters.

---

## Step 9: Revalidation Route Integration

**File: `packages/web-app/src/app/ops/revalidate-cache/route.ts`**

Update POST handler:
1. Run eBay revalidation (existing logic, unchanged)
2. In a **separate try/catch**, run `revalidateAmazonListings()`
3. Record Amazon metrics regardless of success/failure
4. Return combined response with both eBay and Amazon stats
5. Only return HTTP 500 if eBay fails (Amazon failure is non-fatal, logged as warning)

---

## Step 10: CronJob Frequency

**File: `k8s/base/cache-revalidation-job.yaml`**

Change schedule from `0 */4 * * *` (every 4 hours) to `*/10 * * * *` (every 10 minutes).

Rationale: With 75 GPUs × 1 Amazon GPU per run × 10-min interval = ~12.5 hours to refresh all Amazon data. eBay staleness check prevents unnecessary eBay API calls at higher frequency — eBay only refreshes when stale (6-hour TTL), so eBay API usage stays the same.

Add `activeDeadlineSeconds: 540` (9 minutes) to prevent overlapping runs.

Update comments to document the dual-source rationale.

---

## Step 11: Metrics

**New file: `packages/web-app/src/pkgs/server/metrics/amazonMetrics.ts`**

New Prometheus metrics (following pattern in `metricsStore.ts` and `ebayMetrics.ts`):

| Metric | Type | Labels | Purpose |
|--------|------|--------|---------|
| `coinpoet_amazon_searches_total` | Counter | `gpu`, `status` (success/error) | Track search attempts and failures per GPU |
| `coinpoet_amazon_listings_cached` | Gauge | `gpu` | Listing count from last search per GPU |
| `coinpoet_amazon_last_success_timestamp_seconds` | Gauge | — | Unix timestamp of last successful search |

**File: `packages/web-app/src/app/ops/metrics/route.ts`**

Merge Amazon metrics registry into the metrics endpoint response alongside existing job and eBay metrics.

---

## Step 12: Alerting Rules

**File: `home-infra-k8s-flux/apps/production/monitoring/prometheus/alerting-rules-gpupoet.yaml`**

Add two new alerts (severity: `critical` to ensure notifications):

```yaml
- alert: AmazonSearchFailure
  expr: 'increase(coinpoet_amazon_searches_total{status="error",instance="gpupoet.com"}[1h]) > 3'
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: Multiple Amazon search failures in the last hour
    description: More than 3 Amazon search errors in 1 hour. Check proxy config and amazon-searcher service.

- alert: AmazonSearchStale
  expr: '(time() - coinpoet_amazon_last_success_timestamp_seconds{instance="gpupoet.com"}) > 7200'
  for: 30m
  labels:
    severity: critical
  annotations:
    summary: No successful Amazon searches in over 2 hours
    description: Amazon searching has not succeeded in over 2 hours. Check amazon-searcher pod logs.
```

---

## Verification Plan

1. **Unit tests:** Parser tests with saved Amazon HTML fixtures, affiliate URL generation tests, zod schema validation tests, filter tests verifying source-aware pass-through
2. **Dev environment:** Build and run the amazon-searcher service via skaffold, trigger revalidation manually via `curl -X POST http://localhost:3000/ops/revalidate-cache`, verify Amazon listings appear in DB with `source = 'amazon'`
3. **Searcher health:** `curl http://amazon-searcher:3001/health` from within the cluster
4. **Metrics:** Check `/ops/metrics` endpoint shows Amazon search counter, listing gauge, and timestamp
5. **Display isolation:** Verify all chart/listing pages still only show eBay data — no Amazon listings visible anywhere on the site
6. **E2E tests:** Run `./scripts/test-e2e` to ensure no regressions
7. **Alerting:** Verify alert rules parse correctly in Prometheus config
