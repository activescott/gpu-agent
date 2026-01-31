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

**Note:** `scripts/dev` is a long-running process that never completes by design. It runs skaffold in dev mode which watches for file changes and syncs them to the container. Run it in a separate terminal or background it.

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

# Reseed database (after modifying data files)
npm run dev:reseed

# Complete reset (deletes cluster and data)
npm run dev:reset
```

### Database Operations

**Prerequisites:** Ensure minikube is running with `npm run dev`

Use `scripts/prisma-migrate` to run Prisma commands. All Prisma commands must run inside the Kubernetes app container since database connections are only available there. This script takes care of that.

```bash
# Create and apply migration (automatically syncs migration file back to local)
./scripts/prisma-migrate migrate dev --name migration_description

# Run migrations (also runs automatically on container startup)
./scripts/prisma-migrate migrate deploy

# Reset database and re-run all migrations + seed
./scripts/prisma-migrate migrate reset

# Check migration status
./scripts/prisma-migrate migrate status

# Seed database (also runs automatically on container startup)
./scripts/prisma-migrate seed

# Generate Prisma client after schema changes
./scripts/prisma-migrate generate

# Access database directly (interactive)
./scripts/psql

# Run a query against local dev database
./scripts/psql 'SELECT COUNT(*) FROM "Listing";'
```

**Creating Migrations:** When you run `./scripts/prisma-migrate migrate dev --name your_migration`, the script:
1. Runs `prisma migrate dev` inside the Kubernetes container
2. Automatically copies any new migration files back to your local `packages/web-app/prisma/migrations/` directory
3. Reminds you to commit the new migration files

This ensures migrations created in the container are properly synced to your local filesystem for version control.

**Automatic Migration Behavior:** Migrations and seeding run automatically when containers start (via `docker/docker-entrypoint.sh`). This applies to both local development and Kubernetes production environments.

**Testing Migrations:** To test new migrations locally, stop the `scripts/dev` process and restart it. The container will restart and run any pending migrations on startup. This matches how migrations run in production, so it's the preferred way to test database schema changes.

**CRITICAL - Migration File Requirement:** When modifying `schema.prisma`, you MUST create a migration file before deploying to production. If you reset the dev database (`prisma migrate reset`) after modifying the schema, the dev database will be in sync with your schema changes, but NO migration file is created. Running `prisma migrate dev` will report "Already in sync" even though production doesn't have the new columns. In this case, you must manually create the migration file:

```bash
# Create migration directory
mkdir -p packages/web-app/prisma/migrations/YYYYMMDDHHMMSS_migration_name

# Create migration.sql with the appropriate ALTER TABLE statement
echo 'ALTER TABLE "TableName" ADD COLUMN "columnName" TYPE;' > packages/web-app/prisma/migrations/YYYYMMDDHHMMSS_migration_name/migration.sql
```

The migration will run automatically on container startup in production.

### Production Database Queries

Use `scripts/psql-prod` to query the production PostgreSQL database:

```bash
# Ad-hoc query
./scripts/psql-prod 'SELECT COUNT(*) FROM "Listing";'

# Run a pre-built report query
./scripts/psql-prod "$(cat scripts/queries/market-snapshot.sql)"
```

**Available Query Scripts** in `scripts/queries/`:
- `market-snapshot.sql` - Current listings by GPU with price stats
- `monthly-price-changes.sql` - Month-over-month price movements
- `price-vs-msrp.sql` - Current prices compared to MSRP
- `condition-analysis.sql` - New vs Used vs Refurbished pricing
- `scalper-premiums.sql` - RTX 50 series markup over MSRP
- `best-deals.sql` - GPUs with biggest discounts below MSRP

**Prerequisites:** kubectl configured with `nas` context and access to `gpupoet-prod` namespace.

### Restoring Production Data to Dev

To restore the latest production database backup to your local dev environment:

```bash
./scripts/restore-prod-db
```

This script will:
1. Connect to nas.activescott.com via SSH (will prompt for passphrase)
2. Download the latest backup to `data/prod-backups/`
3. Restore the backup to your local dev database

**Prerequisites:**
- Dev environment running (`npm run dev`)
- SSH access to nas.activescott.com

### GPU Market Report Generation

Monthly GPU market reports can be generated using Claude Code from the `gpu-poet-data` repo:

```bash
claude "Run the gpu-market-report skill for February 2026"
```

The skill is defined in `gpu-poet-data/.claude/skills/gpu-market-report/SKILL.md`.

Existing reports are TSX files in `packages/web-app/src/app/gpu/market-report/`.

### Testing

Use `scripts/test-e2e` to run e2e tests. This script handles setup and runs tests against the local dev environment.

```bash
# Run all e2e tests against localhost
./scripts/test-e2e

# Run specific test file
./scripts/test-e2e tests/gpu-ranking.spec.ts

# Run tests in headed mode (see browser)
./scripts/test-e2e --headed

# Run e2e tests against production (gpupoet.com)
cd e2e-tests && npm run test:prod
```

**Verifying Infrastructure Changes:** When modifying Docker or Kubernetes files (Dockerfiles, entrypoint scripts, k8s manifests, skaffold.yaml), always verify by:
1. Running `npm run dev` and confirming the container starts
2. Running `./scripts/test-e2e` to ensure the application functions correctly

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

### Search Engine Notification

The site automatically notifies search engines about content changes using a Kubernetes CronJob that runs every 4 hours. It supports two providers:

#### IndexNow (Bing, Yandex)
- Enabled by default when `INDEXNOW_API_KEY` is set
- Notifies Bing, Yandex, and other participating search engines instantly
- Generate key: `packages/indexnow-notifier/scripts/generate-key.sh`

#### Google Indexing API (Optional)

**Important Limitation:** Google's Indexing API officially only supports pages with `JobPosting` or `BroadcastEvent` structured data. For general websites, it works but is outside Google's official guidelines. Many sites use it anyway with success.

**Setup Steps:**

1. **Create Google Cloud Project & Enable API**
   - Go to [Google Cloud Console API Setup](https://console.cloud.google.com/start/api?id=indexing.googleapis.com)
   - Create a new project or select existing
   - Enable the Indexing API

2. **Create Service Account**
   - Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Click "Create Service Account"
   - Enter name (e.g., "gpupoet-indexing")
   - Skip permissions section, click Continue
   - In "Create key" section, select **JSON** format
   - Click Create - downloads `*.json` key file
   - **Store this file securely** - it's the only copy

3. **Add Service Account to Search Console**
   - Go to [Google Search Console](https://search.google.com/search-console/)
   - Select your property (gpupoet.com)
   - Go to Settings > Users and permissions
   - Click "Add user"
   - Enter service account email from JSON file (`client_email` field)
   - Set permission to **Owner**

4. **Configure Environment Variable**
   ```bash
   # Base64 encode the JSON key file
   base64 -i service-account.json

   # Add to k8s secret as GOOGLE_SERVICE_ACCOUNT_JSON
   ```

**Rate Limits:**
| Provider | Default Quota | Batch Size |
|----------|---------------|------------|
| IndexNow | 10,000 URLs/request | 10,000 |
| Google | 200 requests/day | 100 URLs/batch |

**Configuration:**
- State is stored per-provider in `/data/pages/indexnow/` and `/data/pages/google/`
- Providers run independently - failure in one doesn't affect the other
- Set `ENABLED_PROVIDERS=indexnow,google` to control which providers run

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
- `/data/gpu-specs/` - GPU specification YAML files (CC BY-SA 4.0)
- `/data/benchmark-data/` - Gaming benchmark YAML files (CC BY-SA 4.0)
- `/data/metric-definitions/` - Metric metadata YAML files (units, descriptions)
- `/data/news-data/` - News article YAML files (CC BY-SA 4.0)

### Adding New Metrics (Specs or Benchmarks)

**Important:** Do NOT hardcode benchmark names, spec names, or slug mappings in TypeScript code. All metric definitions are data-driven from YAML files and loaded into the database at seed time.

**To add a new GPU spec metric:**
1. Add the field to GPU spec YAML files in `/data/gpu-specs/`
2. Add metadata to `/data/metric-definitions/specs.yaml` (slug, name, unit, description)
3. Run `npx prisma db seed` (or restart the dev environment)

**To add a new gaming benchmark:**
1. Add benchmark YAML file to `/data/benchmark-data/`
2. Map GPU names in `/data/benchmark-data/gpu-name-mapping.yaml`
3. Add the field mapping in `prisma/seed.ts` (`benchmarkFieldMap` for GPU model field, `getBenchmarkGpuField` for slug-to-field mapping)
4. Run `npx prisma db seed`

The `MetricDefinition` table stores all metric metadata and the `gpuField` column maps URL slugs to TypeScript GPU model field names. This allows adding new metrics without code changes to routes or components.

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
