# GPU Market Report Generator

Generate a monthly GPU market report for GPU Poet.

## Usage

```bash
claude "Run the gpu-market-report skill for [Month Year]"
```

## What This Skill Does

1. **Query production database** using `./scripts/psql-prod` for:
   - RTX 50 series scalper premiums (price vs MSRP)
   - Best used deals (GPUs below MSRP)
   - Month-over-month price changes
   - New vs Used price gaps
   - AMD GPU deals

2. **Analyze trends** to identify:
   - GPUs with biggest price drops (buy signals)
   - GPUs with rising prices (sell/wait signals)
   - Best value in each category (budget/mid/high-end)
   - Unusual market movements

3. **Create TSX report file** at:
   - `packages/web-app/src/app/gpu/market-report/gpu-market-report-{month}-{year}/page.tsx`

4. **Register metadata** in:
   - `packages/web-app/src/app/gpu/market-report/reports/index.ts`

## SQL Queries to Run

Use these pre-built queries from `scripts/queries/`:

```bash
# RTX 50 series scalper premiums
./scripts/psql-prod "$(cat scripts/queries/scalper-premiums.sql)"

# Best deals below MSRP
./scripts/psql-prod "$(cat scripts/queries/best-deals.sql)"

# Month-over-month price changes
./scripts/psql-prod "$(cat scripts/queries/monthly-price-changes.sql)"

# New vs Used pricing
./scripts/psql-prod "$(cat scripts/queries/condition-analysis.sql)"

# Full price vs MSRP analysis
./scripts/psql-prod "$(cat scripts/queries/price-vs-msrp.sql)"

# Current market snapshot
./scripts/psql-prod "$(cat scripts/queries/market-snapshot.sql)"
```

## Report Architecture

Reports are **TSX React Server Components** that:
- Live at `/gpu/market-report/gpu-market-report-{month}-{year}/page.tsx`
- Use high-order chart components that fetch their own data
- Metadata is registered separately for sitemap and news page listings

### Available Chart Components

Import from `@/pkgs/server/components/charts`:

| Component | Description | Chart Type |
|-----------|-------------|------------|
| `ScalperPremiumChart` | RTX 50 series markup over MSRP | Bar |
| `BestDealsChart` | GPUs selling below MSRP | Diverging bar |
| `PriceChangesChart` | Month-over-month price movements | Diverging bar |
| `PriceHistoryChart` | 6-month price trends | Line |
| `AmdDealsChart` | AMD GPU deals vs MSRP | Diverging bar |

All components take a `dateRange: { from: "YYYY-MM", to: "YYYY-MM" }` prop.

## Creating a New Report

### Step 1: Create the page file

Create folder and file:
```
packages/web-app/src/app/gpu/market-report/gpu-market-report-{month}-{year}/page.tsx
```

### Step 2: Use this template

```tsx
/**
 * GPU Market Report - {Month Year}
 */
import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { ReportLayout, ChartSection } from "../components"
import type { MarketReportMetadata } from "../reports"
import {
  ScalperPremiumChart,
  BestDealsChart,
  PriceChangesChart,
  PriceHistoryChart,
  AmdDealsChart,
} from "@/pkgs/server/components/charts"

/**
 * Report metadata - single source of truth for this report.
 */
export const reportMetadata: MarketReportMetadata = {
  slug: "gpu-market-report-{month}-{year}",
  title: "GPU Market {Month Year}: [Key Headline]",
  description: "Brief description for search/social.",
  publishedAt: new Date("YYYY-MM-DDTHH:mm:ssZ"),
  updatedAt: new Date("YYYY-MM-DDTHH:mm:ssZ"),
  author: "Scott Willeke",
  tags: ["market-report", "gpu-prices", "buying-guide", "analysis"],
  dateRange: { from: "YYYY-MM", to: "YYYY-MM" },
}

export async function generateMetadata(): Promise<Metadata> {
  const { slug, title, description, author, tags, publishedAt, updatedAt, dateRange } = reportMetadata
  const ogImageUrl = `https://gpupoet.com/api/images/chart/ScalperPremiumChart?from=${dateRange.from}&to=${dateRange.to}`

  return {
    title,
    description,
    authors: { name: author },
    keywords: [...tags, "GPU prices", "market report", "GPU deals"],
    publisher: "GPU Poet",
    openGraph: {
      title,
      description,
      url: `https://gpupoet.com/gpu/market-report/${slug}`,
      type: "article",
      publishedTime: publishedAt.toISOString(),
      modifiedTime: updatedAt.toISOString(),
      authors: [author],
      tags,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    alternates: { canonical: `https://gpupoet.com/gpu/market-report/${slug}` },
  }
}

export default async function Report(): Promise<ReactNode> {
  const { dateRange } = reportMetadata

  return (
    <ReportLayout metadata={reportMetadata}>
      <div className="lead mb-5">
        <p>Introduction paragraph...</p>
      </div>

      <ChartSection title="Section Title">
        <p className="mb-4">Editorial content before chart...</p>
        <ScalperPremiumChart dateRange={dateRange} />
        <div className="alert alert-warning mt-3">
          <strong>Our take:</strong> Analysis and recommendations...
        </div>
      </ChartSection>

      {/* More sections... */}
    </ReportLayout>
  )
}
```

### Step 3: Register in the index

Add import to `packages/web-app/src/app/gpu/market-report/reports/index.ts`:

```typescript
import { reportMetadata as february2026 } from "../gpu-market-report-february-2026/page"

const reports: MarketReportMetadata[] = [
  february2026,
  january2026,
]
```

## Article Structure

1. **Introduction** - Key findings summary
2. **RTX 50 Series** - Scalper premium analysis (if relevant)
3. **Best Value Used Cards** - RTX 30/40 series deals
4. **AMD Deals** - Radeon alternatives
5. **Month-over-Month Changes** - Price movement trends
6. **6-Month Price History** - Trend visualization
7. **Buy/Wait/Sell Recommendations** - Actionable advice

## GPU Links

Link to GPU pages using `/gpu/shop/{gpu-name}`:

```tsx
<Link href="/gpu/shop/nvidia-geforce-rtx-3080">RTX 3080</Link>
```

## Tips for Engaging Content

- Use specific numbers in headlines ("148% above MSRP" not "significantly above")
- Include actionable Buy/Wait/Sell recommendations
- Compare to MSRP to show real value
- Highlight the most surprising/newsworthy finding
- Keep editorial content concise - let charts tell the story
- Use alert boxes for recommendations: `alert-success` (buy), `alert-warning` (wait), `alert-danger` (avoid)

## Example Headlines

- "RTX 5090 Hits 148% Above MSRP While Used RTX 30 Series Offers 46% Savings"
- "February GPU Prices: RTX 4070 Super Drops to $650, Best Value in Months"
- "Spring GPU Market: RTX 50 Scalper Premiums Finally Normalizing"

## Verifying Editorial Accuracy

**IMPORTANT:** After writing the article, verify that all hardcoded editorial claims match the actual chart data. Charts are dynamically generated from the database, but editorial text is static - they can drift out of sync.

### What to Verify

Every hardcoded claim needs verification:
- GPU names mentioned in editorial text
- Specific prices (e.g., "$303", "$208")
- Percentage changes (e.g., "76% drop", "-63% off MSRP")
- Rankings (e.g., "lowest premium", "biggest drop")

### How to Verify

Each chart component has its own SQL query. To verify editorial claims match chart data:

1. **Find the chart's query** - Look in the chart source file at `src/pkgs/server/components/charts/{ChartName}.tsx`

2. **Adapt the query for psql-prod** - Extract the SQL and replace template variables with actual dates:

```bash
# Example: Running a chart's query manually
# 1. Open src/pkgs/server/components/charts/BestDealsChart.tsx
# 2. Copy the SQL from the $queryRaw block
# 3. Replace ${startDate} and ${endDate} with actual dates
# 4. Run with psql-prod:

./scripts/psql-prod "
  -- Paste adapted SQL here with actual date values
  -- e.g., WHERE \"cachedAt\" >= '2026-01-01' AND \"cachedAt\" <= '2026-01-31 23:59:59'
"
```

3. **Compare results to editorial** - Ensure GPUs mentioned are actually in the chart's top N results and prices/percentages match

### Verification Checklist

For each chart section in the article:

- [ ] Is the GPU mentioned in editorial actually shown in the chart?
- [ ] Do the prices in editorial match the chart's sublabels?
- [ ] Do the percentages in editorial match the chart's values?
- [ ] Does the title/headline stat match the lead chart data?

For hardcoded tables (like data center GPUs):

- [ ] Run a query to get current prices for those specific GPUs
- [ ] Update the table values to match query results

### Common Pitfalls

1. **Chart shows different GPUs than editorial mentions** - The chart shows top N by a metric, but editorial mentions a GPU not in top N
2. **Prices from wrong time period** - Query used different date range than the report's `dateRange`
3. **Percentage direction confusion** - Discounts are negative (-63%), premiums are positive (+50%)
4. **Stale data** - Editorial was written from old query results that have since changed

### Quick Visual Check

Load the report in the dev environment and for each chart:
1. Does the chart show the GPUs mentioned in the editorial text below it?
2. Do the chart's displayed values match the editorial's numbers?

## Reference Implementation

See the January 2026 report:
- Page: `packages/web-app/src/app/gpu/market-report/gpu-market-report-january-2026/page.tsx`
- Metadata: `packages/web-app/src/app/gpu/market-report/reports/index.ts`
