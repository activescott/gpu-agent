# GPU Agent: Smart GPU Price Comparisons

GPU Agent provides machine learning performance metrics for all the most popular GPUs for Machine Learning. It also includes near real-time listings for GPUs aimed at Machine LEarning across multiple sites (currently eBay is supported). You can compare one GPU to another as well as see the cost/performance metrics of GPUs based on real-time prices.

Check it out at https://coinpoet.com

GPU Agent is a project I created to scratch an itch I've had since I used to buy and sell GPUs for mining cryptocurrency. With the rise of interest in GPUs that the excitement around LLMs brought I decided to pursue it.

The tech stack used is TypeScript, NextJS, Prisma, and PostgresSQL.

## Development Setup

### Docker Development

This project can be run locally using Docker containers for development purposes.

#### Quick Start

```bash
# Start with development database
npm run docker:dev
```

#### Environment Setup

1. Copy your environment variables to `apps/web/.env`:
```bash
cp apps/web/.env.example apps/web/.env
```

2. Update the following variables for Docker development:
- `POSTGRES_PRISMA_URL` - Will be overridden by docker-compose
- `POSTGRES_URL_NON_POOLING` - Will be overridden by docker-compose  
- `NEXT_PUBLIC_DOMAIN` - Set to `localhost:3000`

#### Manual Commands

##### Build
```bash
docker build -t gpu-agent .
```

##### Run with Docker Compose
```bash
# Development
docker-compose up --build

# Stop services
docker-compose down
```

##### Database Operations
```bash
# Access database
docker-compose exec postgres psql -U gpu_agent -d gpu_agent

# Run migrations manually
docker-compose exec app sh -c "cd /app/apps/web && npx prisma migrate deploy"

# Seed database manually  
docker-compose exec app sh -c "cd /app/apps/web && npx prisma db seed"
```

#### Health Checks

- Application: http://localhost:3000/api/health
- Metrics: http://localhost:3000/ops/metrics

#### Architecture Differences from Vercel

- **Database**: Uses PostgreSQL container instead of Neon
- **Environment**: Variables loaded from `apps/web/.env`
- **Static files**: Served by Next.js standalone server

#### Development Notes

- The Docker setup is intended for local development
- Production deployments will use Kubernetes with external database services
- Database data persists in Docker volumes between container restarts
- Sitemap generation happens via GitHub Actions and the result is committed to the repo

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
