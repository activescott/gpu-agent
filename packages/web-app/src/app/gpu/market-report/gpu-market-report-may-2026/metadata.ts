import type { MarketReportMetadata } from "../reports"

export const reportMetadata: MarketReportMetadata = {
  slug: "gpu-market-report-may-2026",
  title:
    "May 2026 Best GPUs for Gaming, AI Inference, and LLM Training: Price/Performance Rankings",
  description:
    "Best bang for your buck GPUs ranked by $/FPS (1440p and 4K), $/INT8 TOP (inference), and $/TFLOP (training). RX 9070 ties RTX 3060 Ti at $1.23/FPS at 1440p. Intel Arc B580 wins AI inference value. RTX 30/40 prices keep climbing.",
  publishedAt: new Date("2026-05-04T06:00:00Z"),
  updatedAt: new Date("2026-05-04T06:00:00Z"),
  author: "Scott Willeke",
  tags: [
    "market-report",
    "gpu-prices",
    "price-performance",
    "ai-gpu",
    "gaming-gpu",
    "buying-guide",
  ],
  dateRange: { from: "2026-04", to: "2026-04" },
}
