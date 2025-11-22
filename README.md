# GPU Agent: Smart GPU Price Comparisons

GPU Agent provides machine learning performance metrics for all the most popular GPUs for Machine Learning. It also includes near real-time listings for GPUs aimed at Machine Learning across multiple sites (currently eBay is supported). You can compare one GPU to another as well as see the cost/performance metrics of GPUs based on real-time prices.

Check it out at https://coinpoet.com

GPU Agent is a project I created to scratch an itch I've had since I used to buy and sell GPUs for mining cryptocurrency. With the rise of interest in GPUs that the excitement around LLMs brought I decided to pursue it.

## Tech Stack & Architecture

**Core Technologies:**
- **Framework**: Next.js with App Router and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker with docker-compose
- **Testing**: Playwright for e2e testing
- **Visualization**: Chart.js for data charts
- **Build System**: Turbo monorepo

**Repository Structure:**
- `packages/ebay-client/` - eBay API client library
- `packages/benchmark-scraper/` - GPU benchmark scraper for OpenBenchmarking.org
- `apps/web/` - Main Next.js web application
- `e2e-tests/` - Playwright end-to-end tests for route structure and redirects
- `tests/e2e/` - Additional Playwright tests

## Development Setup

### Quick Start (Recommended)

```bash
# Start development environment (app + postgres)
npm run docker:dev
```

### Environment Setup

1. Copy your environment variables to `apps/web/.env`:
```bash
cp apps/web/.env.local.template apps/web/.env
```

2. Configure required environment variables in `apps/web/.env`:
   - `EBAY_CLIENT_ID` - Get from https://developer.ebay.com/my/keys
   - `EBAY_CLIENT_SECRET` - Get from https://developer.ebay.com/my/keys
   - `EBAY_AFFILIATE_CAMPAIGN_ID` - Get from eBay Partner Network
   - `PUBLIC_POSTHOG_KEY` - Get from PostHog settings

**Database Configuration:**
- `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are NOT set in .env files
- These are provided by container orchestration:
  - **Local Development**: docker-compose.yml environment section
  - **Production**: Kubernetes secrets
- .env files contain comments documenting this pattern

### Docker Development Commands

```bash
# Start development environment
npm run docker:dev

# Complete rebuild (when schema/migrations change)
npm run docker:down
npm run docker:dev

# Check application logs
docker compose logs app --tail=20

# Stop all services
npm run docker:down
```

### Database Operations

**Prerequisites:** Ensure Docker containers are running with `npm run docker:dev`

```bash
# Create and apply migration (run inside Docker container)
docker-compose exec app sh -c "cd /app/apps/web && npx prisma migrate dev --name migration_description"

# Generate Prisma client after schema changes (run inside Docker container)
docker-compose exec app sh -c "cd /app/apps/web && npx prisma generate"

# Access database directly
docker-compose exec postgres psql -U gpu_agent -d gpu_agent

# Run migrations manually (migrations run automatically on container startup via docker-entrypoint.sh)
docker-compose exec app sh -c "cd /app/apps/web && npx prisma migrate deploy"

# Seed database manually (seeding also runs automatically on container startup)
docker-compose exec app sh -c "cd /app/apps/web && npx prisma db seed"

# View database schema
docker-compose exec app sh -c "cd /app/apps/web && npx prisma db pull"
```

**Note:** All Prisma commands must be run inside the Docker container since the database connection strings are only available in the container environment.

**Automatic Migration Behavior:** Migrations and seeding run automatically when containers start (via `scripts/docker-entrypoint.sh`). This applies to both Docker development and Kubernetes production environments.

### Testing

```bash
# Run e2e tests for new route structure
cd e2e-tests
npm install
npx playwright install
npm test

# Run e2e tests in headed mode (see browser)
npm run test:headed

# Run existing e2e tests (from tests/e2e directory)
cd tests/e2e
npx playwright test

# Run specific test
npx playwright test tests/historical-data.spec.ts
```

### Health Checks

- Application: http://localhost:3000/api/health
- Metrics: http://localhost:3000/ops/metrics

### GPU Benchmark Scraping

**New Feature:** GPU Agent now includes gaming benchmarks in addition to AI/ML specifications.

#### Scraping Benchmarks from OpenBenchmarking.org

```bash
# Navigate to benchmark scraper package
cd packages/benchmark-scraper

# Install dependencies
npm install
npx playwright install chromium

# Scrape all benchmarks
npm run scrape

# Scrape specific benchmarks
npm run scrape:cs2      # Counter-Strike 2
npm run scrape:3dmark   # 3DMark Wild Life Extreme
```

**Output:** Benchmark data is saved to `data/benchmark-data/` as YAML files.

**GPU Name Mapping:** The scraper uses `packages/benchmark-scraper/src/gpu-name-mapping.yaml` to map GPU names from OpenBenchmarking to coinpoet GPU slugs. When unmapped GPUs are found, the scraper logs warnings with GPU names to add to the mapping file.

**Seeding Benchmarks:** After scraping, restart Docker to seed the database:

```bash
# Benchmark data is automatically seeded on container startup
npm run docker:down
npm run docker:dev
```

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

## Route Structure

### Current Routes (New Structure)

GPU Agent uses a category-based route structure supporting both AI/ML and Gaming use cases:

**Buy/Shopping Pages:**
- `/gpu/buy/[gpuSlug]` - Individual GPU listings
- `/gpu/buy/[category]/cost-per-[metric]` - Cost-performance pages
  - Example: `/gpu/buy/ai/cost-per-fp32-flops`
  - Example: `/gpu/buy/gaming/cost-per-counter-strike-2-fps-3840x2160`

**Ranking Pages:**
- `/gpu/ranking/[category]/[metric]` - GPU rankings by cost-performance
  - Example: `/gpu/ranking/ai/fp32-flops`
  - Example: `/gpu/ranking/gaming/counter-strike-2-fps-3840x2160`

**Learn Pages:**
- `/gpu/learn/ai/use-case/[useCase]` - AI/ML use case guides
- `/gpu/learn/ai/models/[model]` - Model-specific guides
- `/gpu/benchmark/gaming/[benchmark]` - Gaming benchmark descriptions

### Legacy Route Redirects

All previous `/ml/*` routes permanently redirect to the new structure:
- `/ml/shop/gpu/*` → `/gpu/buy/*`
- `/ml/learn/gpu/ranking/*` → `/gpu/ranking/ai/*`
- `/ml/learn/*` → `/gpu/learn/ai/*`

See `apps/web/next.config.mjs` for complete redirect mapping.

## Code Conventions

### ESLint Rules
- `no-magic-numbers` - Use named constants instead of numeric literals
- `complexity` limits - Break down complex functions
- `unicorn/prefer-number-properties` - Use `Number.parseInt()` instead of `parseInt()`
- `import/no-unused-modules` - Remove unused exports (warnings on API routes are normal)

### Error Prevention
- Always use optional chaining for nullable properties: `data?.field?.toFixed(0) || 'N/A'`
- Add null safety for all Chart.js data processing
- Defensive programming for API responses

### Routing Conventions
- Internal testing pages: `/internal/` (excluded from sitemap)
- API routes: `/internal/api/` for development endpoints
- Layout files: `layout.tsx` for page-level metadata

## File Locations Reference

### Key Configuration Files
- `/apps/web/prisma/schema.prisma` - Database schema
- `/apps/web/.env` - Environment variables (Docker overrides these)
- `/docker-compose.yml` - Container configuration
- `/tests/e2e/playwright.config.ts` - E2E test configuration

### Important Code Locations
- `/apps/web/src/pkgs/server/db/` - Database repositories
- `/apps/web/src/app/internal/` - Internal testing pages
- `/apps/web/src/app/internal/api/` - Internal API endpoints
- `/apps/web/prisma/migrations/` - Database migration files

## Deployment

### Production Notes
- Production deployments use Kubernetes with external database pod
- Database data persists in Docker volumes between container restarts

### Manual Sitemap Generation

If you need to manually update the sitemap with current Git timestamps:

```bash
cd apps/web
npm run gen-sitemap
git add src/app/sitemap.static-pages.json
git commit -m "chore: update sitemap"
```

The sitemap is automatically updated by GitHub Actions when relevant files change.

## License

### Code

The code in this project is licensed under the MIT License. See the `LICENSE_CODE` file for more information.

### Data & Content

The data (such as but not limited to those files in data/gpu-data) and content (such as but not limited to the pages under a "learn" path in the site) in this project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0). See the `LICENSE_DATA_AND_CONTENT` file for more information.
