/**
 * Shared definitions for pricing metrics used across GPU Poet.
 *
 * "Lowest average price" is the canonical headline price metric:
 * the average of the three lowest-priced listings each day. It's more
 * realistic than a median or mean over all listings because it reflects
 * what a buyer could actually pay by picking the best available listings,
 * and it's resilient to both scam-lowball and outlier-premium listings.
 */

const ISO_MONTH_PAD = 2

export const LOWEST_AVERAGE_PRICE_LABEL = "lowest average price"

export const LOWEST_AVERAGE_PRICE_DEFINITION =
  "the average of the three lowest-priced listings each day — a realistic estimate of what a buyer could actually pay"

/**
 * Aggregated lowest-average price statistics for a specific month.
 * All prices use the daily "lowest average" (avg of 3 lowest listings per day)
 * as the underlying data point, then aggregated across the month.
 */
export interface MonthlyLowestAveragePriceStats {
  /** Mean of the daily lowest-average prices across the month */
  meanLowestAvgPrice: number
  /** Minimum daily lowest-average price seen in the month (best deal day) */
  minLowestAvgPrice: number
  /** Maximum daily lowest-average price seen in the month (worst deal day) */
  maxLowestAvgPrice: number
  /** Number of days that had at least one tracked listing in the month */
  daysWithData: number
}

interface DailyPricePoint {
  date: Date | string
  lowestAvgPrice: number
}

/**
 * Buckets daily price history points by YYYY-MM and computes
 * lowest-average stats per month.
 */
export function bucketDailyPricesByMonth(
  dailyData: DailyPricePoint[],
): Map<string, MonthlyLowestAveragePriceStats> {
  const byMonth = new Map<string, DailyPricePoint[]>()
  for (const point of dailyData) {
    const d = point.date instanceof Date ? point.date : new Date(point.date)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(ISO_MONTH_PAD, "0")}`
    const bucket = byMonth.get(iso)
    if (bucket) {
      bucket.push(point)
    } else {
      byMonth.set(iso, [point])
    }
  }

  const result = new Map<string, MonthlyLowestAveragePriceStats>()
  for (const [iso, points] of byMonth) {
    const validPoints = points.filter((p) => p.lowestAvgPrice > 0)
    if (validPoints.length === 0) continue

    const lowestAvgs = validPoints.map((p) => p.lowestAvgPrice)
    const meanLowestAvgPrice =
      lowestAvgs.reduce((sum, p) => sum + p, 0) / lowestAvgs.length

    result.set(iso, {
      meanLowestAvgPrice,
      minLowestAvgPrice: Math.min(...lowestAvgs),
      maxLowestAvgPrice: Math.max(...lowestAvgs),
      daysWithData: validPoints.length,
    })
  }
  return result
}
