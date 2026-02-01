/**
 * Market Report Registry
 *
 * Imports metadata from each report's page.tsx file.
 * Each report defines its own `reportMetadata` export as the single source of truth.
 *
 * To add a new report:
 * 1. Create folder: /gpu/market-report/gpu-market-report-{month}-{year}/page.tsx
 * 2. Export `reportMetadata` from the page
 * 3. Import and add to the `reports` array below
 */
import type { DateRange } from "@/pkgs/server/components/charts"

// Import metadata from each report page
import { reportMetadata as february2026 } from "../gpu-market-report-february-2026/page"
import { reportMetadata as january2026 } from "../gpu-market-report-january-2026/page"

/**
 * Metadata for a market report.
 */
export interface MarketReportMetadata {
  slug: string
  title: string
  description: string
  publishedAt: Date
  updatedAt: Date
  author: string
  tags: string[]
  dateRange: DateRange
}

/**
 * All market reports, newest first.
 */
const reports: MarketReportMetadata[] = [february2026, january2026]

/**
 * Lists all market report metadata, sorted by publish date (newest first).
 */
export function listMarketReports(): MarketReportMetadata[] {
  return [...reports].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  )
}
