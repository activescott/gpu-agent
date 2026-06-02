import type { MarketReportMetadata } from "../reports"

export const reportMetadata: MarketReportMetadata = {
  slug: "gpu-market-report-june-2026",
  title:
    "June 2026 Best GPUs for Gaming, AI Inference, and LLM Training: Price/Performance Rankings",
  description:
    "Best bang for your buck GPUs ranked by $/FPS (1440p and 4K), $/INT8 TOP (inference), and $/TFLOP (training). RTX 5070 Ti drops 9% below MSRP and becomes the best practical training value. H100 resale crashes -49% MoM. Intel Arc B570 first card under $1/INT8 TOP.",
  publishedAt: new Date("2026-06-02T06:00:00Z"),
  updatedAt: new Date("2026-06-02T06:00:00Z"),
  author: "Scott Willeke",
  tags: [
    "market-report",
    "gpu-prices",
    "price-performance",
    "ai-gpu",
    "gaming-gpu",
    "buying-guide",
  ],
  dateRange: { from: "2026-05", to: "2026-05" },
}
