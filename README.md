# GPU Agent: Smart GPU Price Comparisons

GPU Agent helps you find the best GPU for your money by combining real-time marketplace prices with performance benchmarks. Whether you're building a gaming rig or a machine learning workstation, you can compare GPUs by cost-per-performance metrics that actually matter.

**Features:**
- **Gaming benchmarks** - Real-world FPS data from Counter-Strike 2, 3DMark, and other popular games
- **AI/ML performance** - FP32/FP16 FLOPS, Tensor Cores, INT8 TOPS, and memory bandwidth metrics
- **Live pricing** - Near real-time GPU listings from eBay with price tracking
- **Cost-per-performance rankings** - See which GPUs deliver the best value for gaming or AI workloads

Check it out at https://gpupoet.com

This project started when I was buying and selling GPUs for cryptocurrency mining and got frustrated with how hard it was to compare actual value across different cards. With the rise of interest in GPUs for both gaming and AI, I built this to solve that problem.

## Licensing

GPU Agent is open source:
- **Application code**: Licensed under the MIT License
- **Data files** (`/data` directory): Licensed under CC BY-SA 4.0 (Creative Commons Attribution-ShareAlike 4.0 International)

This means you're free to use, modify, and distribute both the code and data, with attribution required for the data.

## Development Setup

### Prerequisites

Install required tools:
```bash
brew install minikube skaffold
```

### Quick Start

```bash
# Start development environment (minikube + skaffold)
npm run dev
```

The app will be available at http://localhost:3000

### Environment Setup

1. Copy environment file template:
```bash
cp k8s/overlays/dev/.env.dev.app.example k8s/overlays/dev/.env.dev.app
```

2. Configure required environment variables in `k8s/overlays/dev/.env.dev.app`:
   - `EBAY_CLIENT_ID` - Get from https://developer.ebay.com/my/keys
   - `EBAY_CLIENT_SECRET` - Get from https://developer.ebay.com/my/keys
   - `EBAY_AFFILIATE_CAMPAIGN_ID` - Get from eBay Partner Network
   - `PUBLIC_POSTHOG_KEY` - Get from PostHog settings

**Database Configuration:**
- Database URLs are configured in `k8s/overlays/dev/.env.dev.app`
- Database credentials are in `k8s/overlays/dev/.env.dev.db`
- These are automatically injected as Kubernetes secrets

### Development Commands

```bash
# Start development environment
npm run dev

# View application logs
npm run dev:logs

# Restart app (triggers migrations)
npm run dev:restart

# Complete reset (deletes cluster and data)
npm run dev:reset
```

### Database Operations

**Prerequisites:** Ensure minikube is running with `npm run dev`

```bash
# Access database directly
minikube kubectl -- exec -it -n gpupoet-dev db-0 -- psql -U gpu_agent -d gpu_agent

# Create and apply migration
minikube kubectl -- exec -n gpupoet-dev deploy/app -- sh -c "cd /app/packages/web-app && npx prisma migrate dev --name migration_description"

# Generate Prisma client after schema changes
minikube kubectl -- exec -n gpupoet-dev deploy/app -- sh -c "cd /app/packages/web-app && npx prisma generate"

# Run migrations manually (migrations run automatically on container startup)
minikube kubectl -- exec -n gpupoet-dev deploy/app -- sh -c "cd /app/packages/web-app && npx prisma migrate deploy"

# Seed database manually (seeding also runs automatically on container startup)
minikube kubectl -- exec -n gpupoet-dev deploy/app -- sh -c "cd /app/packages/web-app && npm run prisma-seed"
```

**Note:** All Prisma commands must be run inside the Kubernetes pod since the database connection strings are only available in the container environment.

**Automatic Migration Behavior:** Migrations and seeding run automatically when containers start (via `docker/docker-entrypoint.sh`). This applies to both local development and Kubernetes production environments.

### Testing

```bash
# Run e2e tests against localhost (default)
cd e2e-tests
npm install
npx playwright install
npm test

# Run e2e tests against production (gpupoet.com)
npm run test:prod

# Run e2e tests in headed mode (see browser)
npm run test:headed

# Run specific test
npx playwright test tests/historical-data.spec.ts

# Run tests against custom environment
BASE_URL=https://staging.example.com npm test
```

**Verifying Infrastructure Changes:** When modifying Docker or Kubernetes files (Dockerfiles, entrypoint scripts, k8s manifests, skaffold.yaml), always verify by:
1. Running `npm run dev` and confirming the container starts
2. Running `cd e2e-tests && npm test` to ensure the application functions correctly

### Health Checks

- Application: http://localhost:3000/api/health
- Metrics: http://localhost:3000/ops/metrics


### Cache Revalidation

**Critical for Data Availability:** The application requires cache revalidation to populate GPU listing data.

#### Development
After starting the development environment, manually trigger cache revalidation to populate data:

```bash
# Trigger cache revalidation (required for initial data)
curl -X POST http://localhost:3000/ops/revalidate-cache
```

This endpoint:
- Fetches fresh GPU listings from eBay API
- Updates cached pricing data
- Typically takes 10-25s to complete
- Must be called at least once for the app to have data

#### Production (Kubernetes)
- **Automated:** Kubernetes CronJob runs every 30m to hit /ops/revalidate-cache
- **Security:** Endpoint blocked from external access via ingress configuration
- **Internal Only:** Accessible only within the Kubernetes cluster
- **Monitoring:** Job results are tracked via Prometheus metrics at `/ops/metrics`

## Database Architecture

### Soft Delete with Versioning
- Uses `archived: boolean` and `archivedAt: DateTime?` instead of hard deletes
- Implements versioning with `version: int` field for change tracking
- Change detection via MD5 hashing of key fields: `itemId + priceValue + title + condition`
- All queries should filter `archived = false` for active records

### Repository Pattern
- Data access layer in `/src/pkgs/server/db/` 
- Example: `ListingRepository.ts` with methods like `getHistoricalPriceData()`
- Always use transaction-aware `PrismaClientWithinTransaction` parameter

## Code Conventions

### ESLint Rules
- `no-magic-numbers` - Use named constants instead of numeric literals
- `complexity` limits - Break down complex functions
- `unicorn/prefer-number-properties` - Use `Number.parseInt()` instead of `parseInt()`
- `import/no-unused-modules` - Remove unused exports (warnings on API routes are normal)

## File Locations Reference

### Key Configuration Files
- `/packages/web-app/prisma/schema.prisma` - Database schema
- `/k8s/overlays/dev/.env.dev.app` - Development environment variables
- `/skaffold.yaml` - Skaffold development configuration
- `/k8s/` - Kubernetes manifests (base + overlays)
- `/e2e-tests/playwright.config.ts` - E2E test configuration

### Important Code Locations
- `/packages/web-app/src/pkgs/server/db/` - Database repositories
- `/packages/web-app/src/app/internal/` - Internal testing pages
- `/packages/web-app/src/app/internal/api/` - Internal API endpoints
- `/packages/web-app/prisma/migrations/` - Database migration files

### Data Locations
- `/data/gpu-data/` - GPU specification YAML files (CC BY-SA 4.0)
- `/data/benchmark-data/` - Gaming benchmark YAML files (CC BY-SA 4.0)
- `/data/news-data/` - News article YAML files (CC BY-SA 4.0)

### Working with Data Files

#### News Articles
**IMPORTANT:** When updating news articles in `/data/news-data/`:
- **ALWAYS update the `updatedAt` field** to the current timestamp
- The database seed script uses `updatedAt` to determine which articles need updating
- If `updatedAt` is not changed, the seed script will NOT update the database with your changes
- Format: ISO 8601 timestamp (e.g., `2025-11-24T10:30:00Z`)

Example:
```yaml
# Before editing
updatedAt: "2025-11-22T10:02:00Z"

# After editing (update to current time)
updatedAt: "2025-11-24T15:45:00Z"
```

## Deployment

### Production Notes
- Production deployments use Kubernetes with persistent volumes for database
- Database data persists in Kubernetes PersistentVolumeClaims

### Manual Sitemap Generation

If you need to manually update the sitemap with current Git timestamps:

```bash
cd packages/web-app
npm run gen-sitemap
git add src/app/sitemap.static-pages.json
git commit -m "chore: update sitemap"
```

The sitemap is automatically updated by GitHub Actions when relevant files change.

## License

### Code

The code in this project is licensed under the MIT License. See the `LICENSE_CODE` file for more information.

### Data & Content

The data (such as but not limited to those files in data/gpu-data) and content (such as but not limited to the pages under a "learn" path in the site) in this project is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0). See the `LICENSE_DATA_AND_CONTENT` file for more information.
