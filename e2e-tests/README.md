# E2E Tests for GPU Agent

End-to-end tests using Playwright to verify the new route structure and redirects.

## Setup

```bash
cd e2e-tests
npm install
npx playwright install
```

## Running Tests

The tests will automatically start the Next.js dev server before running.

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests with UI
```bash
npm run test:ui
```

### View test report
```bash
npm run report
```

## Test Files

- `health-check.spec.ts` - Basic health checks for the application
- `redirects.spec.ts` - Tests for all /ml/* → /gpu/* redirects
- `new-routes.spec.ts` - Tests for new route structure and functionality

## Prerequisites

Before running tests, ensure:
1. Docker is running with the database
2. Database has been seeded with GPU data
3. Port 3000 is available for the dev server

## Notes

- Tests use `http://localhost:3000` as the base URL
- The Playwright config automatically starts the dev server
- Some tests are marked as `.skip()` if they require benchmark data that hasn't been scraped yet
