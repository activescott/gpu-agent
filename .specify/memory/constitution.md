<!--
  Sync Impact Report
  ==================
  Version change: N/A → 1.0.0 (initial adoption)

  Added principles:
    - I. Test-Driven Development
    - II. Data-Driven Architecture
    - III. Infrastructure as Code
    - IV. Production Database Protection
    - V. Data Preservation
    - VI. Operational Observability

  Added sections:
    - Technology & Stack Constraints
    - Development Workflow
    - Governance

  Removed sections: N/A (initial version)

  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ No updates needed
      (Constitution Check section is already generic and will
      reference these principles dynamically)
    - .specify/templates/spec-template.md: ✅ No updates needed
      (Template is requirement-focused, no principle-specific
      sections to sync)
    - .specify/templates/tasks-template.md: ✅ No updates needed
      (Test-first guidance already present in template; migration
      tasks fit naturally into Foundational phase)
    - .specify/templates/checklist-template.md: ✅ No updates needed
      (Generic template, checklist items generated per-feature)
    - .specify/templates/agent-file-template.md: ✅ No updates needed
      (Generic template for development guidelines)

  Follow-up TODOs: None
-->

# GPU Poet Constitution

## Core Principles

### I. Test-Driven Development

All feature development MUST follow a test-first discipline:

- Unit tests are the preferred testing layer. Every new function
  or module MUST have corresponding unit tests written before
  the implementation.
- For critical functionality, high-risk code paths, or
  infrastructure changes (Dockerfiles, Kubernetes manifests,
  entrypoint scripts, skaffold.yaml), Playwright end-to-end tests
  MUST be written and MUST pass before committing.
- The Red-Green-Refactor cycle is mandatory: tests MUST be written
  first, tests MUST fail, then implementation makes them pass.
- Test coverage is not a vanity metric. Tests MUST exercise
  meaningful behavior, not just lines of code.

**Rationale**: Catching regressions early is cheaper than debugging
production incidents. TDD also forces better API design by making
the developer think about usage before implementation.

### II. Data-Driven Architecture

All GPU metrics, benchmarks, and spec definitions MUST be defined
in YAML data files, not hardcoded in application code:

- GPU specifications live in `/data/gpu-specs/` as YAML files.
- Benchmark data lives in `/data/benchmark-data/` as YAML files.
- Metric metadata (slugs, names, units, descriptions) lives in
  `/data/metric-definitions/` as YAML files.
- Adding a new metric or benchmark MUST NOT require TypeScript
  code changes to routes or components. The `MetricDefinition`
  database table and seed process handle the mapping.
- News articles in `/data/news-data/` MUST have their `updatedAt`
  field set to the current timestamp whenever edited, or the
  seed script will skip the update.

**Rationale**: Data-driven design decouples content from code,
enabling non-developers to contribute data and reducing the risk
of bugs from scattered hardcoded values.

### III. Infrastructure as Code

All infrastructure MUST be defined declaratively and version
controlled:

- Kubernetes manifests in `/k8s/` (base + overlays) define the
  deployment topology.
- Skaffold (`skaffold.yaml`) manages the development loop.
- Database schema changes MUST be captured as Prisma migration
  files in `packages/web-app/prisma/migrations/`.
- Environment configuration is injected via Kubernetes secrets
  from `.env` files in overlays.
- The development environment MUST be started via `scripts/dev`
  and MUST NOT use raw minikube commands.
- `minikube kubectl` MUST be used instead of bare `kubectl`.

**Rationale**: Declarative infrastructure eliminates
configuration drift between environments and makes deployments
reproducible and auditable.

### IV. Production Database Protection

The production database MUST NEVER be modified directly:

- All schema changes MUST go through Prisma migration files that
  run automatically on pod startup via `docker-entrypoint.sh`.
- Every migration MUST be tested in the local dev environment
  first by stopping and restarting `scripts/dev` to verify the
  migration runs successfully on container startup.
- Direct SQL against production (`scripts/psql-prod`) is
  permitted ONLY for read-only queries. No INSERT, UPDATE,
  DELETE, ALTER, DROP, or TRUNCATE statements against production.
- If `prisma migrate dev` reports "Already in sync" after a
  schema change and database reset, a migration file MUST be
  manually created before deploying to production.

**Rationale**: Production data is irreplaceable. Untested or
ad-hoc schema changes risk data loss, downtime, and corruption.
The migration-on-startup pattern ensures every environment runs
the same migration path.

### V. Data Preservation

Listing data and pricing data MUST NEVER be permanently deleted:

- The application uses soft delete (`archived: boolean`,
  `archivedAt: DateTime?`) instead of hard deletes for all
  listing and pricing records.
- All queries for active records MUST filter on
  `archived = false`.
- Historical pricing data has long-term value for trend analysis
  and MUST be retained indefinitely.
- The `version` field and MD5 change-detection hash track record
  history without destroying previous states.
- Permanent deletion of any listing or pricing record is
  prohibited, even in development, unless explicitly rebuilding
  the database from scratch (`prisma migrate reset`).

**Rationale**: Historical GPU pricing data cannot be recovered
once deleted. It provides unique long-term analytical value for
market trend analysis, which is a core differentiator of the
product.

### VI. Operational Observability

The application MUST expose operational health and metrics:

- Health check endpoint at `/api/health` MUST be maintained.
- Prometheus metrics endpoint at `/ops/metrics` MUST report
  cache revalidation job results and other operational data.
- Structured JSON logging (pino) MUST be used for all server-side
  log output. No unstructured `console.log` in production code.
- Cache revalidation via `/ops/revalidate-cache` MUST be
  restricted to internal cluster access only (blocked by ingress
  from external traffic).
- CronJob health (revalidation every 30m, IndexNow every 4h)
  MUST be monitored.

**Rationale**: Observability is not optional for a system that
depends on external data sources (eBay API) and runs
autonomously via CronJobs. Silent failures in data pipelines
directly degrade the user experience.

## Technology & Stack Constraints

- **Runtime**: Node.js with TypeScript (Next.js web application)
- **Database**: PostgreSQL via Prisma ORM
- **Container orchestration**: Kubernetes (minikube for dev,
  bare-metal for prod)
- **Build tooling**: Skaffold for dev loop, Docker for images
- **Testing**: Playwright for e2e tests; unit test framework
  per package
- **Logging**: pino (structured JSON)
- **Analytics**: PostHog
- **External APIs**: eBay Browse API for live GPU listings
- **Licensing**: MIT for code, CC BY-SA 4.0 for data

ESLint rules are enforced and MUST NOT be disabled without
justification:
- `no-magic-numbers`: Use named constants
- `complexity`: Break down complex functions
- `unicorn/prefer-number-properties`: Use `Number.parseInt()`
- `import/no-unused-modules`: Remove unused exports

## Development Workflow

- Feature development follows the speckit workflow:
  `/speckit.specify` -> `/speckit.plan` -> `/speckit.tasks` ->
  `/speckit.implement`.
- All approved plans are saved to
  `/Users/scott/src/activescott/gpu-poet-data/docs/plans/`
  with format `YYYY-MM-DD-plan-name.md`.
- Git commits MUST be signed. Never skip commit signing.
- When staging files for git, add specific files by name.
  Never use `git add -A` or `git add .`.
- Infrastructure changes (Docker, Kubernetes, entrypoint scripts)
  MUST be verified by:
  1. Running `npm run dev` and confirming the container starts.
  2. Running `./scripts/test-e2e` to ensure the application
     functions correctly.
- Database migrations MUST be tested locally before merging by
  restarting the dev environment and confirming the migration
  runs on container startup.

## Governance

This constitution defines the non-negotiable engineering
principles for the GPU Poet project. All pull requests, code
reviews, and implementation decisions MUST comply with these
principles.

- **Amendment process**: Any change to this constitution MUST be
  documented with a version bump, rationale, and sync impact
  report (prepended as an HTML comment).
- **Versioning**: Semantic versioning applies. MAJOR for principle
  removals or redefinitions, MINOR for new principles or material
  expansions, PATCH for clarifications and wording fixes.
- **Compliance review**: When reviewing code, verify that changes
  do not violate any principle. Constitution violations MUST be
  resolved before merging.
- **Runtime guidance**: See `README.md` for detailed development
  setup, database operations, and deployment procedures.

**Version**: 1.0.0 | **Ratified**: 2026-01-29 | **Last Amended**: 2026-01-29
