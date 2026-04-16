import type { MarketReportMetadata } from "../reports"

export const reportMetadata: MarketReportMetadata = {
  slug: "gpu-market-report-april-2026",
  title:
    "April 2026 Best GPUs for Gaming, AI Inference, and LLM Training: Price/Performance Rankings",
  description:
    "Best bang for your buck GPUs ranked by $/FPS (1440p and 4K), $/INT8 TOP (inference), and $/TFLOP (training). RTX 3060 Ti leads 1440p value. RTX 30 prices reverse after months of decline.",
  publishedAt: new Date("2026-04-06T06:00:00Z"),
  updatedAt: new Date("2026-04-16T18:00:00Z"),
  author: "Scott Willeke",
  tags: [
    "market-report",
    "gpu-prices",
    "price-performance",
    "ai-gpu",
    "gaming-gpu",
    "buying-guide",
  ],
  dateRange: { from: "2026-03", to: "2026-03" },
}
