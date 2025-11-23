# GPU Agent: Smart GPU Price Comparisons

GPU Agent provides machine learning performance metrics for all the most popular GPUs for Machine Learning. It also includes near real-time listings for GPUs aimed at Machine Learning across multiple sites (currently eBay is supported). You can compare one GPU to another as well as see the cost/performance metrics of GPUs based on real-time prices.

Check it out at https://coinpoet.com

GPU Agent is a project I created to scratch an itch I've had since I used to buy and sell GPUs for mining cryptocurrency. With the rise of interest in GPUs that the excitement around LLMs brought I decided to pursue it.

## Open Core Model

GPU Agent uses an **open core** model:
- **Open Source**: The application code in this repository is licensed under the MIT License
- **Private Data**: GPU specifications, gaming benchmark data, and scraping tools are maintained in a separate private repository. Any data in the **/data/** directory is licensed under CC BY-SA 4.0.

The private data repository is integrated as a git submodule at `/data`. This allows the application code to remain open while protecting proprietary data collection efforts.

## Development Setup

### Prerequisites

**Access to Private Data Repository:** This project uses a private git submodule for GPU and benchmark data. You need access to the [`gpu-agent-data`](https://github.com/activescott/gpu-agent-data) repository IF you don't have your own data.

### Clone the Repository

Clone the repository with submodules to include the private data:

```bash
# Clone with submodules (recommended)
git clone --recurse-submodules https://github.com/activescott/gpu-agent.git

# Or if you already cloned without submodules:
git submodule update --init --recursive
```

**Important:** The application requires the data submodule to be checked out. The Docker build and database seeding will fail if the data is missing.

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

**Note:** The benchmark scraping tools are located in the private data repository (`data/packages/benchmark-scraper/`).

#### Scraping Benchmarks from OpenBenchmarking.org

```bash
# Navigate to benchmark scraper package (in the data submodule)
cd data/packages/benchmark-scraper

# Install dependencies
npm install
npx playwright install chromium

# Scrape all benchmarks
npm run scrape

# Scrape specific benchmarks
npm run scrape:cs2      # Counter-Strike 2
npm run scrape:3dmark   # 3DMark Wild Life Extreme
```

**Output:** Benchmark data is saved to `data/data/benchmark-data/` as YAML files.

**GPU Name Mapping:** The scraper uses `data/data/benchmark-data/gpu-name-mapping.yaml` to map GPU names from OpenBenchmarking to coinpoet GPU slugs. When unmapped GPUs are found, the scraper logs warnings with GPU names to add to the mapping file.

**Seeding Benchmarks:** After scraping, commit changes in the data submodule, then update the submodule reference in the main repo and restart Docker to seed the database:

```bash
# Commit changes in the data submodule
cd data
git add .
git commit -m "chore: update benchmark data"
git push

# Update submodule reference in main repo
cd ..
git add data
git commit -m "chore: update data submodule"

# Restart Docker to seed the database
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

## Code Conventions

### ESLint Rules
- `no-magic-numbers` - Use named constants instead of numeric literals
- `complexity` limits - Break down complex functions
- `unicorn/prefer-number-properties` - Use `Number.parseInt()` instead of `parseInt()`
- `import/no-unused-modules` - Remove unused exports (warnings on API routes are normal)

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

### Data Locations (Private Submodule)
- `/data/data/gpu-data/` - GPU specification YAML files
- `/data/data/benchmark-data/` - Gaming benchmark YAML files
- `/data/packages/benchmark-scraper/` - Web scraping tools for OpenBenchmarking.org

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

The data (such as but not limited to those files in data/gpu-data) and content (such as but not limited to the pages under a "learn" path in the site) in this project is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0). See the `LICENSE_DATA_AND_CONTENT` file for more information.
