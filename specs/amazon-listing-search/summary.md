# Amazon Listing Search Integration — Implementation Summary

## What was done

### 1. Database Schema (Step 1)
- Added `source String @default("ebay")` to the `Listing` model in `prisma/schema.prisma`
- Created migration `20260321000000_add_listing_source` that:
  - Adds the `source` column (backfills all existing rows as "ebay")
  - Updates the `one_active_per_item` unique index to include `source`
  - Adds composite index on `[gpuName, source, archived, cachedAt]`

### 2. Amazon Searcher Microservice (Step 2)
- New package at `packages/amazon-searcher/` with:
  - Express HTTP server (POST `/search`, GET `/health`) on port 3001
  - Playwright Firefox scraper with Oxylabs proxy integration
  - Cheerio HTML parser using resilient ARIA/data-attribute selectors
  - Amazon affiliate URL generation (optional `affiliateTag` param)
  - 7 Firefox user agents, human-like scrolling, homepage-first anti-bot measures
  - Parser + affiliate unit tests (11 tests passing)
  - Dockerfile (node:22-slim with Playwright Firefox)

### 3. K8s Resources (Step 3)
- `k8s/base/amazon-searcher-deployment.yaml` — Deployment with 1 replica, port 3001, Oxylabs env vars from `app-creds` secret
- `k8s/base/amazon-searcher-service.yaml` — ClusterIP service (no ingress, cluster-internal only)
- Updated `kustomization.yaml` to include new resources
- Dev overlay deletes amazon-searcher resources (not needed in dev)

### 4. Configuration (Step 4)
- Added `AMAZON_SEARCHER_URL` (defaults to `http://amazon-searcher:3001`) and `AMAZON_AFFILIATE_TAG` (optional) to `SERVER_CONFIG`
- Improved `CACHED_LISTINGS_DURATION_MS` comment to describe dual-source staleness
- Added K8s env vars to `app-deployment.yaml`

### 5. Listing Model (Step 5)
- Added `source?: ListingSource` to the `Listing` interface
- Added Zod schemas: `AmazonSearchResultSchema`, `AmazonSearchResponseSchema`
- Added `convertAmazonResultToListing()` function

### 6. Source-Aware Filters (Step 6)
- Each filter now checks `item.source` and passes through if not applicable:
  - `sellerFeedbackFilter` — eBay only (Amazon has no seller info from search)
  - `allListingFilters` — eBay only (affiliate link, FIXED_PRICE, variations)
  - `conditionFilter` — both sources: eBay uses conditionId, Amazon treats null as "New"
  - `createRequiredLabelFilter`, `createRequireMemoryKeywordFilter`, `gpuAccessoryFilter` — both sources

### 7. Amazon Caching Logic (Step 7)
- New `packages/web-app/src/pkgs/server/listings/amazon.ts` with `cacheAmazonListingsForGpu()`
- Calls the amazon-searcher service via HTTP, validates response with Zod
- New `revalidateAmazonListings()` in `listings.ts`:
  - Finds the single most-stale GPU for Amazon (or one with no Amazon data)
  - Refreshes only that one GPU per run (anti-bot measure)

### 8. Repository Changes (Step 8)
- `addOrRefreshListingsForGpu` and `archiveStaleListingsForGpu` now accept `source` parameter
- All display/chart queries filter `source = 'ebay'` (Amazon data hidden from site)
- New `findMostStaleGpuForSource()` function for Amazon revalidation

### 9. Revalidation Route (Step 9)
- Updated POST handler to run Amazon revalidation after eBay, in separate try/catch
- Amazon failures are non-fatal (logged as warning, eBay results unaffected)
- Records Amazon metrics on each run

### 10. CronJob Frequency (Step 10)
- Changed from `0 */4 * * *` (every 4 hours) to `*/10 * * * *` (every 10 minutes)
- Added `activeDeadlineSeconds: 540` to prevent overlapping runs
- Updated comments documenting dual-source rationale

### 11. Amazon Metrics (Step 11)
- New `amazonMetrics.ts` with:
  - `coinpoet_amazon_searches_total` (Counter, labels: gpu, status)
  - `coinpoet_amazon_listings_cached` (Gauge, label: gpu)
  - `coinpoet_amazon_last_success_timestamp_seconds` (Gauge)
- Merged into `/ops/metrics` endpoint

### 12. Alerting Rules (Step 12)
- `AmazonSearchFailure` — fires if >3 errors in 1 hour (critical)
- `AmazonSearchStale` — fires if no success in 2+ hours (critical)

## Files modified
- `packages/web-app/prisma/schema.prisma`
- `packages/web-app/src/pkgs/isomorphic/config.ts`
- `packages/web-app/src/pkgs/isomorphic/model/index.ts`
- `packages/web-app/src/pkgs/isomorphic/model/listing.ts`
- `packages/web-app/src/pkgs/server/cacheConfig.ts`
- `packages/web-app/src/pkgs/server/listingFilters.ts`
- `packages/web-app/src/pkgs/server/listings/index.ts`
- `packages/web-app/src/pkgs/server/listings/listings.ts`
- `packages/web-app/src/pkgs/server/db/ListingRepository.ts`
- `packages/web-app/src/app/ops/revalidate-cache/route.ts`
- `packages/web-app/src/app/ops/metrics/route.ts`
- `k8s/base/kustomization.yaml`
- `k8s/base/app-deployment.yaml`
- `k8s/base/cache-revalidation-job.yaml`
- `k8s/overlays/dev/kustomization.yaml`
- `home-infra-k8s-flux/apps/production/monitoring/prometheus/alerting-rules-gpupoet.yaml`

## Files created
- `packages/amazon-searcher/` (entire package — 12 files)
- `packages/web-app/prisma/migrations/20260321000000_add_listing_source/migration.sql`
- `packages/web-app/src/pkgs/server/listings/amazon.ts`
- `packages/web-app/src/pkgs/server/metrics/amazonMetrics.ts`
- `k8s/base/amazon-searcher-deployment.yaml`
- `k8s/base/amazon-searcher-service.yaml`

## Local Testing

The amazon-searcher runs in minikube alongside the web app via Skaffold, just like production.

### Prerequisites
- Oxylabs credentials in `k8s/overlays/dev/.env.dev.app` (see `.env.dev.app.example`; create/retrieve at https://dashboard.oxylabs.io/en/overview/RP/users)
- minikube running with Skaffold (`skaffold dev`)
- Playwright Firefox is installed inside the amazon-searcher Docker image automatically

### Step 1: Start the full stack in minikube

```bash
skaffold dev
```

This builds and deploys both the web app and amazon-searcher into minikube. The app is port-forwarded to `localhost:3000`. The amazon-searcher runs cluster-internally on port 3001.

### Step 2: Test the amazon-searcher directly

Port-forward the searcher service, then use the test script:

```bash
# In a separate terminal:
kubectl --context minikube -n gpupoet-dev port-forward svc/amazon-searcher 3001:3001

# Run the test script (health check + search + summary)
scripts/test-amazon-searcher
# Or with a custom query:
scripts/test-amazon-searcher localhost:3001 "AMD Radeon RX 9070 XT"
```

**What to verify:**
- Health check returns 200
- Search returns multiple listings with prices
- Prices are reasonable for the GPU model
- Top 5 cheapest listings shown are actual GPU cards
- Takes 15-30 seconds (homepage visit + delays + scroll)

### Step 3: Test the full end-to-end flow

Trigger cache revalidation, which calls amazon-searcher from within the cluster:

```bash
scripts/test-amazon-revalidation
# Or with explicit host/password:
scripts/test-amazon-revalidation localhost:3000 admin
```

**What to verify:**
- Revalidation returns 200
- Amazon metrics show `status="success"` incrementing
- `coinpoet_amazon_listings_cached` shows listing counts per GPU
- `coinpoet_amazon_last_success_timestamp_seconds` is recent

### Step 4: Watch logs

```bash
# Amazon searcher logs:
kubectl --context minikube -n gpupoet-dev logs -f deploy/amazon-searcher

# Web app logs (amazon-related):
kubectl --context minikube -n gpupoet-dev logs -f deploy/app | grep -i amazon
```

### Troubleshooting
- **0 results**: Check amazon-searcher logs for errors. The "Continue shopping" interstitial might not be getting clicked.
- **Proxy errors**: Verify `OXYLABS_USERNAME` and `OXYLABS_PASSWORD` are set in `k8s/overlays/dev/.env.dev.app`.
- **Timeout errors**: Oxylabs proxy can be slow — check amazon-searcher pod logs for timeout messages.
- **"Sorry" dog page**: The proxy IP may be flagged. Oxylabs session rotation should help — each request gets a new session ID.
- **Pod not starting**: Check `kubectl --context minikube -n gpupoet-dev describe pod` for image pull or resource issues. The amazon-searcher image is large (~1GB) due to Playwright Firefox.

## Production Deployment Steps

### Step 1: Add amazon-searcher to Flux

The amazon-searcher K8s resources exist in the gpu-poet repo (`k8s/base/`) but are NOT yet in the Flux repo. Add them:

```bash
# In home-infra-k8s-flux repo:

# Copy the deployment and service from gpu-poet to flux base
cp /path/to/gpu-poet/k8s/base/amazon-searcher-deployment.yaml \
   apps/base/gpupoet/amazon-searcher-deployment.yaml
cp /path/to/gpu-poet/k8s/base/amazon-searcher-service.yaml \
   apps/base/gpupoet/amazon-searcher-service.yaml

# Add to base kustomization.yaml:
#   - amazon-searcher-deployment.yaml
#   - amazon-searcher-service.yaml

# In production overlay kustomization.yaml, add imagePullSecrets patch:
#   - patch: |-
#       - op: add
#         path: /spec/template/spec/imagePullSecrets
#         value:
#           - name: github-container-registry-secret
#     target:
#       kind: Deployment
#       name: amazon-searcher

# Add image policy for amazon-searcher in production overlay:
#   images:
#     - name: amazon-searcher-image-placeholder
#       newName: ghcr.io/activescott/gpu-agent/amazon-searcher
#       newTag: latest
```

### Step 2: Set secrets

Add to the encrypted `.env.secret.app` in the Flux production overlay:
```
OXYLABS_USERNAME=your-username
OXYLABS_PASSWORD=your-password
AMAZON_AFFILIATE_TAG=yourtag-20
```

### Step 3: Build and push Docker image

The amazon-searcher Dockerfile should be built and pushed to GHCR. Add it to the GitHub Actions workflow (`.github/workflows/build.yaml`) or build manually:

```bash
cd packages/amazon-searcher
docker build -t ghcr.io/activescott/gpu-agent/amazon-searcher:latest .
docker push ghcr.io/activescott/gpu-agent/amazon-searcher:latest
```

### Step 4: Deploy and verify

```bash
# Flux should auto-reconcile, or force it:
flux reconcile kustomization gpupoet-prod --with-source

# Verify the pod is running:
kubectl -n gpupoet-prod get pods | grep amazon-searcher

# Check health:
kubectl -n gpupoet-prod exec -it deploy/app -- curl http://amazon-searcher:3001/health

# Check logs:
kubectl -n gpupoet-prod logs deploy/amazon-searcher -f
```

## Production Validation

### Step 1: Verify the amazon-searcher pod is healthy

```bash
kubectl -n gpupoet-prod get pods | grep amazon-searcher
kubectl -n gpupoet-prod exec -it deploy/app -- curl -s http://amazon-searcher:3001/health
# Expected: {"status":"ok"}
```

### Step 2: Test the searcher directly from your machine

```bash
# Port-forward the searcher service
kubectl -n gpupoet-prod port-forward svc/amazon-searcher 3001:3001

# Use the test script
scripts/test-amazon-searcher
```

### Step 3: Test the full end-to-end flow via revalidation

```bash
# Use the test script against production
scripts/test-amazon-revalidation gpupoet.com <admin-password>
```

Or watch logs while triggering:
```bash
# Terminal 1: watch amazon-searcher logs
kubectl -n gpupoet-prod logs -f deploy/amazon-searcher

# Terminal 2: trigger revalidation
scripts/test-amazon-revalidation gpupoet.com <admin-password>
```

**What to verify in logs:**
- `[search] Starting search for: "<gpu-name>"`
- `[search] Completed: "<gpu-name>" — N results in Xms`
- No error messages

### Step 4: Check Prometheus metrics and alerts

Visit https://gpupoet.com/ops/metrics and verify:
- `coinpoet_amazon_searches_total{status="success"}` > 0
- `coinpoet_amazon_searches_total{status="error"}` stays at 0 (or very low)
- `coinpoet_amazon_listings_cached` shows counts per GPU
- `coinpoet_amazon_last_success_timestamp_seconds` is recent

The Prometheus alerting rules are already configured:
- **AmazonSearchFailure**: Fires if >3 errors in 1 hour
- **AmazonSearchStale**: Fires if no success in 2+ hours

Verify they're loaded:
```bash
kubectl -n monitoring port-forward svc/prometheus-server 9090:80
# Visit http://localhost:9090/alerts — both rules should be inactive/green
```

### Step 5: Monitor for 24-48 hours

Watch for:
- Consistent `coinpoet_amazon_searches_total{status="success"}` growth (every ~10 min via CronJob)
- `coinpoet_amazon_last_success_timestamp_seconds` staying fresh (within last 30 min)
- No alerting rule firings
- Amazon-searcher pod not restarting (`kubectl -n gpupoet-prod get pods` restarts column)
- Memory usage staying within 512Mi limit

## Monitoring Dashboard

### Grafana Dashboard (add to Flux repo)

Create a Grafana dashboard JSON at:
`home-infra-k8s-flux/apps/production/monitoring/grafana/dashboards/gpupoet-amazon.json`

Key panels to include:

1. **Amazon Search Success Rate** — `rate(coinpoet_amazon_searches_total{status="success"}[1h]) / rate(coinpoet_amazon_searches_total[1h])`
2. **Amazon Search Error Rate** — `rate(coinpoet_amazon_searches_total{status="error"}[1h])`
3. **Amazon Listings Cached per GPU** — `coinpoet_amazon_listings_cached` (gauge, per-GPU labels)
4. **Time Since Last Success** — `time() - coinpoet_amazon_last_success_timestamp_seconds`
5. **Amazon Searcher Pod Memory** — `container_memory_usage_bytes{pod=~"amazon-searcher.*"}`
6. **Amazon Searcher Pod CPU** — `rate(container_cpu_usage_seconds_total{pod=~"amazon-searcher.*"}[5m])`
7. **Search Duration** — If you add a histogram metric for search duration, track p50/p95/p99

To provision automatically via Flux, add a ConfigMap with the dashboard JSON and reference it in the Grafana HelmRelease values under `dashboardProviders` / `dashboardsConfigMaps`.
