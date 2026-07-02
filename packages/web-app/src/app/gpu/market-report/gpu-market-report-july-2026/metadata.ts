import type { MarketReportMetadata } from "../reports"

export const reportMetadata: MarketReportMetadata = {
  slug: "gpu-market-report-july-2026",
  title:
    "July 2026 Best GPUs for Gaming, AI Inference, and LLM Training: Price/Performance Rankings",
  description:
    "Best bang for your buck GPUs ranked by $/FPS (1440p and 4K), $/INT8 TOP (inference), and $/TFLOP (training). June was a buyer's market: mainstream cards fell ~20% MoM, the RTX 5090 premium cooled from 83% to 52% over MSRP, and used Ampere/RDNA2 cards hit new lows. RTX 3060 Ti leads 1440p value at $1.13/FPS.",
  publishedAt: new Date("2026-07-01T16:00:00Z"),
  updatedAt: new Date("2026-07-01T16:00:00Z"),
  author: "Scott Willeke",
  tags: [
    "market-report",
    "gpu-prices",
    "price-performance",
    "ai-gpu",
    "gaming-gpu",
    "buying-guide",
  ],
  dateRange: { from: "2026-06", to: "2026-06" },
}
