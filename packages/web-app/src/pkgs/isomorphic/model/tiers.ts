/**
 * Shared tier/percentile constants for GPU rankings.
 * Used for both display tier dividers and generating pros/cons structured data.
 */

export const PERCENTILE_TOP_TIER = 0.75
export const PERCENTILE_MIDDLE_TIER = 0.5
export const PERCENTILE_ENTRY_TIER = 0.25

export type TierThreshold = {
  percentile: number
  label: string
  shortLabel: string
}

export const TIER_THRESHOLDS: TierThreshold[] = [
  {
    percentile: PERCENTILE_TOP_TIER,
    label: "Top Tier - 75th Percentile",
    shortLabel: "Top Tier",
  },
  {
    percentile: PERCENTILE_MIDDLE_TIER,
    label: "Middle Tier - 50th Percentile",
    shortLabel: "Mid Tier",
  },
  {
    percentile: PERCENTILE_ENTRY_TIER,
    label: "Entry Tier - 25th Percentile",
    shortLabel: "Entry Tier",
  },
]
