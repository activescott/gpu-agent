# GPU Poet: Smart GPU Price Comparisons

GPU Poet helps you find the best GPU for your money by combining real-time marketplace prices with performance benchmarks. Whether you're building a gaming rig or a machine learning workstation, you can compare GPUs by cost-per-performance metrics that actually matter.

**Features:**
- **Gaming benchmarks** - Real-world FPS data from Counter-Strike 2, 3DMark, and other popular games
- **AI/ML performance** - FP32/FP16 FLOPS, Tensor Cores, INT8 TOPS, and memory bandwidth metrics
- **Live pricing** - Near real-time GPU listings from eBay with price tracking
- **Cost-per-performance rankings** - See which GPUs deliver the best value for gaming or AI workloads

Check it out at https://gpupoet.com

This project started when I was buying and selling GPUs for cryptocurrency mining and got frustrated with how hard it was to compare actual value across different cards. With the rise of interest in GPUs for both gaming and AI, I built this to solve that problem.

## Licensing

GPU Poet is open source:
- **Application code**: Licensed under the MIT License (see `LICENSE_CODE`)
- **Data files** (`/data` directory): Licensed under CC BY-SA 4.0 (see `LICENSE_DATA_AND_CONTENT`)

## Development Setup

### Prerequisites

```bash
brew install minikube skaffold
```

### Quick Start

```bash
# Start development environment (minikube + skaffold)
npm run dev
```

`scripts/dev` is a long-running process — it runs skaffold in dev mode watching for file changes. Run it in a separate terminal. The app will be available at http://localhost:3000.

### Environment Setup

1. Copy the template: `cp k8s/overlays/dev/.env.dev.app.example k8s/overlays/dev/.env.dev.app`
2. Fill in required values:
   - `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` — from https://developer.ebay.com/my/keys
   - `EBAY_AFFILIATE_CAMPAIGN_ID` — from eBay Partner Network
   - `PUBLIC_POSTHOG_KEY` — from PostHog settings
3. Database credentials are in `k8s/overlays/dev/.env.dev.db` (injected as K8s secrets automatically)

### Common Commands

```bash
npm run dev              # Start dev environment
npm run dev:logs         # View application logs
npm run dev:reseed       # Reseed database after modifying data files
npm run dev:reset        # Complete reset (deletes cluster and data)
```

### Database

All Prisma commands run inside the K8s container via `scripts/prisma-migrate`:

```bash
./scripts/prisma-migrate migrate dev --name description   # Create migration
./scripts/prisma-migrate migrate reset                     # Reset + reseed
./scripts/prisma-migrate migrate status                    # Check status
./scripts/prisma-migrate seed                              # Seed only
./scripts/prisma-migrate generate                          # Regenerate client
./scripts/psql                                             # Interactive psql
./scripts/psql 'SELECT COUNT(*) FROM "Listing";'           # Ad-hoc query
```

Migration files are automatically synced back to `packages/web-app/prisma/migrations/` after creation. Migrations and seeding run automatically on container startup.

### Production Database

```bash
./scripts/psql-prod 'SELECT COUNT(*) FROM "Listing";'
./scripts/psql-prod "$(cat scripts/queries/market-snapshot.sql)"
```

Pre-built queries in `scripts/queries/`: `market-snapshot.sql`, `monthly-price-changes.sql`, `price-vs-msrp.sql`, `condition-analysis.sql`, `scalper-premiums.sql`, `best-deals.sql`

Requires kubectl configured with `nas` context and access to `gpupoet-prod` namespace.

### Restoring Production Data to Dev

```bash
./scripts/restore-prod-db
```

Downloads the latest backup from nas.activescott.com and restores it to local dev. Requires dev environment running + SSH access.

### GPU Market Reports

Monthly reports are generated using Claude Code from the `gpu-poet-data` repo:

```bash
claude "Run the gpu-market-report skill for February 2026"
```

Reports live in `packages/web-app/src/app/gpu/market-report/`.

### Testing

```bash
./scripts/test-e2e                              # All e2e tests
./scripts/test-e2e tests/gpu-ranking.spec.ts    # Specific test
./scripts/test-e2e --headed                     # Headed mode
cd e2e-tests && npm run test:prod               # Against production
```

### Health Checks

- Application: http://localhost:3000/api/health
- Metrics: http://localhost:3000/ops/metrics

### Cache Revalidation

The app needs cache revalidation to populate listing data. In dev, trigger it manually after starting:

```bash
curl -X POST http://localhost:3000/ops/revalidate-cache
```

In production, a K8s CronJob runs this every 30 minutes automatically.

### Deployment

- Production runs on Kubernetes with persistent volumes for the database
- Pushes to `main` trigger GitHub Actions to build and publish a container image
- Flux watches for new images and rolls out the deployment
