import type { MarketReportMetadata } from "../reports"

export const reportMetadata: MarketReportMetadata = {
  slug: "gpu-market-report-september-2026",
  title:
    "September 2026 GPU Price/Performance Rankings: Resale Is Now Cheaper Than Retail on Every RTX 50 Card",
  description:
    "Best bang for your buck GPUs ranked by $/FPS (1440p and 4K), $/INT8 TOP (inference), and $/TFLOP (training). Every RTX 50 card rose in August and all of them now cost less on the resale market than at retail. The used RTX 30 series is the one corner still getting cheaper: RTX 3060 Ti leads 1440p value at $1.05/FPS and the RTX 3070 fell 16% to $177.",
  publishedAt: new Date("2026-09-01T16:00:00Z"),
  updatedAt: new Date("2026-09-01T16:00:00Z"),
  author: "Scott Willeke",
  tags: [
    "market-report",
    "gpu-prices",
    "price-performance",
    "ai-gpu",
    "gaming-gpu",
    "buying-guide",
  ],
  dateRange: { from: "2026-08", to: "2026-08" },
}
