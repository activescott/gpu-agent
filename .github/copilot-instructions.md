# GitHub Copilot Instructions for GPU Agent

## Project Overview
- **GPU Agent**: Next.js app for GPU price comparison and ML performance metrics
- **Tech Stack**: TypeScript, Next.js, Prisma, PostgreSQL, Turbo monorepo
- **Deployment**: Currently Vercel, containerized for Kubernetes migration

## Repository Structure
```
/
├── apps/web/           # Main Next.js application
├── packages/           # Shared packages
│   └── ebay-client/    # eBay API client workspace package
├── data/               # GPU specs and news data (YAML files)
└── scripts/            # Utility scripts
```

## Key Commands
```bash
# Development
npm run dev                    # Start all workspaces in dev mode
npm run docker:dev             # Start with PostgreSQL in Docker

# Building & Testing
npm run build                  # Build all workspaces with Turbo
npm run lint                   # Lint all workspaces
npm run test                   # Run tests

# Database (from apps/web/)
npm run prisma-generate        # Generate Prisma client
npm run prisma-dev             # Run migrations in dev
npm run prisma-seed            # Seed database

# Sitemap (from apps/web/)
npm run gen-sitemap            # Generate sitemap with Git timestamps
```

## Important Notes

### Monorepo Workspace
- Uses npm workspaces with Turbo for build orchestration
- `@activescott/ebay-client` is a local workspace package
- Always run commands from root unless specified otherwise

### Environment Setup
- Environment variables in `apps/web/.env`
- Docker Compose loads from `apps/web/.env` automatically
- Database URLs are overridden in Docker environment

### Sitemap Generation
- Static sitemap is committed to repo: `apps/web/src/app/sitemap.static-pages.json`
- Generated with Git timestamps via `npm run gen-sitemap`
- GitHub Action auto-updates when relevant files change
- **Never generate sitemap during Docker builds** - copy the committed file because it requires Git context.

### Docker Development
- Use `npm run docker:dev` for full development environment
- PostgreSQL container with persistent volumes
- Health checks available at `/api/health` and `/ops/metrics`
- Ready for Kubernetes deployment (no production Docker Compose needed)

### Code Style
- Use lowercase for shell script variable names
- React components should use named function expressions: `function MyComponent() { ... }`

### Database & External APIs
- Uses eBay API for real-time GPU listings
- PostHog for analytics
- GPU specifications stored in `data/gpu-data/*.yaml`
- News articles in `data/news-data/*.yaml`
