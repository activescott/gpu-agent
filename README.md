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

### Quick Start (Recommended)

```bash
# Start development environment (app + postgres)
npm run docker:dev
```

### Environment Setup

1. Copy your environment variables to `packages/web-app/.env`:
```bash
cp packages/web-app/.env.local.template packages/web-app/.env
```

2. Configure required environment variables in `packages/web-app/.env`:
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
docker-compose exec app sh -c "cd /app/packages/web-app && npx prisma migrate dev --name migration_description"

# Generate Prisma client after schema changes (run inside Docker container)
docker-compose exec app sh -c "cd /app/packages/web-app && npx prisma generate"

# Access database directly
docker-compose exec postgres psql -U gpu_agent -d gpu_agent

# Run migrations manually (migrations run automatically on container startup via docker-entrypoint.sh)
docker-compose exec app sh -c "cd /app/packages/web-app && npx prisma migrate deploy"

# Seed database manually (seeding also runs automatically on container startup)
docker-compose exec app sh -c "cd /app/packages/web-app && npx prisma db seed"

# View database schema
docker-compose exec app sh -c "cd /app/packages/web-app && npx prisma db pull"
```

**Note:** All Prisma commands must be run inside the Docker container since the database connection strings are only available in the container environment.

**Automatic Migration Behavior:** Migrations and seeding run automatically when containers start (via `scripts/docker-entrypoint.sh`). This applies to both Docker development and Kubernetes production environments.

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
- `/packages/web-app/.env` - Environment variables (Docker overrides these)
- `/docker-compose.yml` - Container configuration
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
- Production deployments use Kubernetes with external database pod
- Database data persists in Docker volumes between container restarts

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
