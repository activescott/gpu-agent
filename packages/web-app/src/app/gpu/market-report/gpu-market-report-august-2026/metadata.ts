import type { MarketReportMetadata } from "../reports"

export const reportMetadata: MarketReportMetadata = {
  slug: "gpu-market-report-august-2026",
  title:
    "August 2026 GPU Price/Performance Rankings: RTX 50 Premiums Cool Toward MSRP as the Mid-Range Firms Up",
  description:
    "Best bang for your buck GPUs ranked by $/FPS (1440p and 4K), $/INT8 TOP (inference), and $/TFLOP (training). In July most of the RTX 50 lineup settled at or below MSRP (only the 5090 still carries a real premium, ~44% over), while the mid-range firmed up (RX 6800 XT +22%, RTX 3060 +16%). RTX 3060 Ti leads 1440p value at $1.13/FPS.",
  publishedAt: new Date("2026-08-01T16:00:00Z"),
  updatedAt: new Date("2026-08-01T16:00:00Z"),
  author: "Scott Willeke",
  tags: [
    "market-report",
    "gpu-prices",
    "price-performance",
    "ai-gpu",
    "gaming-gpu",
    "buying-guide",
  ],
  dateRange: { from: "2026-07", to: "2026-07" },
}
