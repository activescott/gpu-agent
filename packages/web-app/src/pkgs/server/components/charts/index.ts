/**
 * High-order chart components for GPU market reports.
 * Each component embeds its own SQL query and returns ChartConfig.
 *
 * Usage:
 * - Import components for page rendering: <ScalperPremiumChart dateRange={...} />
 * - Import config fetchers for image API: getScalperPremiumConfig(dateRange)
 */

// Types
export type { DateRange, ChartComponentProps } from "./types"
export {
  CHART_HASHTAGS,
  parseDateRange,
  formatGpuName,
  getValueColor,
} from "./types"

// Chart Components (React Server Components)
export { ScalperPremiumChart } from "./ScalperPremiumChart"
export { BestDealsChart } from "./BestDealsChart"
export { PriceChangesChart } from "./PriceChangesChart"
export { PriceHistoryChart } from "./PriceHistoryChart"
export { AmdDealsChart } from "./AmdDealsChart"
export { GpuPriceHistoryChart } from "./GpuPriceHistoryChart"

// Config Fetchers (for image API)
export { getScalperPremiumConfig } from "./ScalperPremiumChart"
export { getBestDealsConfig } from "./BestDealsChart"
export { getPriceChangesConfig } from "./PriceChangesChart"
export { getPriceHistoryConfig } from "./PriceHistoryChart"
export { getAmdDealsConfig } from "./AmdDealsChart"
export { getGpuPriceHistoryConfig } from "./GpuPriceHistoryChart"

import type { ChartConfig } from "@/pkgs/isomorphic/model/news"
import type { DateRange } from "./types"
import { getScalperPremiumConfig } from "./ScalperPremiumChart"
import { getBestDealsConfig } from "./BestDealsChart"
import { getPriceChangesConfig } from "./PriceChangesChart"
import { getPriceHistoryConfig } from "./PriceHistoryChart"
import { getAmdDealsConfig } from "./AmdDealsChart"

/**
 * Registry mapping component names to their config fetcher functions.
 * Used by the image API to dynamically render charts.
 */
export const chartConfigFetchers: Record<
  string,
  (dateRange: DateRange) => Promise<ChartConfig>
> = {
  ScalperPremiumChart: getScalperPremiumConfig,
  BestDealsChart: getBestDealsConfig,
  PriceChangesChart: getPriceChangesConfig,
  PriceHistoryChart: getPriceHistoryConfig,
  AmdDealsChart: getAmdDealsConfig,
}

/**
 * List of all available chart component names.
 */
export const CHART_COMPONENT_NAMES = Object.keys(chartConfigFetchers)
