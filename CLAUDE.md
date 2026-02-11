# Claude Code Instructions

This file contains instructions and context for Claude Code sessions working with this repository.

## Important Instructions

- Always use scripts/dev to start the dev environment:
  - Don't use minikube commands directly to start it.
  - Run `./scripts/dev` directly without output redirection - it provides all needed output
  - Don't redirect output (e.g., `> /tmp/file.log`) - it causes permission prompts
  - To stop: `./scripts/dev stop`
  - To restart: `./scripts/dev stop && ./scripts/dev`
  - The dev environment takes ~33s to start. Start it in background and use `sleep 33` right away.
- Always use `minikube kubectl` instead of bare `kubectl` for the correct context.
- Save all approved plans to `/Users/scott/src/activescott/gpu-poet-data/docs/plans/` with format `YYYY-MM-DD-plan-name.md`.
- **Taking screenshots**: Use `./scripts/screenshot <url> [output-dir]` to capture pages for visual verification. It auto-splits long pages into viewport-sized chunks. Dev environment must be running first. Use `SELECTOR='.my-class'` to capture a specific element.

## Database Architecture

### Soft Delete with Versioning
- Uses `archived: boolean` and `archivedAt: DateTime?` instead of hard deletes
- Implements versioning with `version: int` field for change tracking
- Change detection via MD5 hashing of key fields: `itemId + priceValue + title + condition`
- Uses `exclude: boolean` and `excludeReason: string?` for data quality filtering (scams, accessories, etc.)

### Query Filter Rules
- Queries for **current/active listings** should filter `archived = false` AND `exclude = false`
- Queries for **historical analysis** (market report charts, price trends) should **NOT** filter on `archived` — listings are archived after just 6 hours off eBay, so all past-month data is archived
- **All queries** must filter `exclude = false` to remove data quality issues (scams, accessories, box-only, etc.)
- Use `cachedAt` (not `createdAt`) for date ranges — `cachedAt` captures "what was on the market during this period" including carry-over listings from prior months still active. `createdAt` only records when a listing was first seen.
- The `priceValue` column is stored as string/Decimal — always cast with `::float` in ORDER BY to avoid alphabetical sorting

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

## Adding New Metrics (Specs or Benchmarks)

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

## Working with Data Files

### News Articles
**IMPORTANT:** When updating news articles in `/data/news-data/`:
- **ALWAYS update the `updatedAt` field** to the current timestamp
- The database seed script uses `updatedAt` to determine which articles need updating
- If `updatedAt` is not changed, the seed script will NOT update the database with your changes
- Format: ISO 8601 timestamp (e.g., `2025-11-24T10:30:00Z`)

## Migration Pitfalls

**Creating Migrations:** When you run `./scripts/prisma-migrate migrate dev --name your_migration`, the script:
1. Runs `prisma migrate dev` inside the Kubernetes container
2. Automatically copies any new migration files back to your local `packages/web-app/prisma/migrations/` directory
3. Reminds you to commit the new migration files

**Automatic Migration Behavior:** Migrations and seeding run automatically when containers start (via `docker/docker-entrypoint.sh`). This applies to both local development and Kubernetes production environments.

**Testing Migrations:** To test new migrations locally, stop the `scripts/dev` process and restart it. The container will restart and run any pending migrations on startup.

**CRITICAL - Migration File Requirement:** When modifying `schema.prisma`, you MUST create a migration file before deploying to production. If you reset the dev database (`prisma migrate reset`) after modifying the schema, the dev database will be in sync with your schema changes, but NO migration file is created. Running `prisma migrate dev` will report "Already in sync" even though production doesn't have the new columns. In this case, you must manually create the migration file:

```bash
mkdir -p packages/web-app/prisma/migrations/YYYYMMDDHHMMSS_migration_name
echo 'ALTER TABLE "TableName" ADD COLUMN "columnName" TYPE;' > packages/web-app/prisma/migrations/YYYYMMDDHHMMSS_migration_name/migration.sql
```

## Search Engine Notification

The site automatically notifies search engines about content changes using a Kubernetes CronJob that runs every 4 hours. It supports two providers:

### IndexNow (Bing, Yandex)
- Enabled by default when `INDEXNOW_API_KEY` is set
- Notifies Bing, Yandex, and other participating search engines instantly
- Generate key: `packages/indexnow-notifier/scripts/generate-key.sh`

### Google Indexing API (Optional)

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

## Manual Sitemap Generation

```bash
cd packages/web-app
npm run gen-sitemap
git add src/app/sitemap.static-pages.json
git commit -m "chore: update sitemap"
```

The sitemap is automatically updated by GitHub Actions when relevant files change.

## Verifying Infrastructure Changes

When modifying Docker or Kubernetes files (Dockerfiles, entrypoint scripts, k8s manifests, skaffold.yaml), always verify by:
1. Running `npm run dev` and confirming the container starts
2. Running `./scripts/test-e2e` to ensure the application functions correctly
