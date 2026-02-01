import type { JSX } from "react"

const PERCENT_MULTIPLIER = 100
const DIVISOR_LAST_DIGIT = 10
const DIVISOR_LAST_TWO_DIGITS = 100
// English ordinal suffix rules: 11th, 12th, 13th are exceptions to 1st, 2nd, 3rd
const ORDINAL_EXCEPTION_MIN = 11
const ORDINAL_EXCEPTION_MAX = 13
const ORDINAL_FIRST = 1
const ORDINAL_SECOND = 2
const ORDINAL_THIRD = 3

const PERCENTILE_75 = 0.75
const PERCENTILE_50 = 0.5
const PERCENTILE_25 = 0.25

// Tier array indices
const TIER_INDEX_TOP = 0
const TIER_INDEX_MID = 1
const TIER_INDEX_ENTRY = 2

type TierThreshold = {
  percentile: number
  label: string
  shortLabel: string
}

const TIER_THRESHOLDS: TierThreshold[] = [
  { percentile: PERCENTILE_75, label: "Top Tier", shortLabel: "Top" },
  { percentile: PERCENTILE_50, label: "Mid Tier", shortLabel: "Mid" },
  { percentile: PERCENTILE_25, label: "Entry Tier", shortLabel: "Entry" },
]

/**
 * Formats a percentile (0-1) as an ordinal string (e.g., "95th")
 */
function formatPercentileOrdinal(percentile: number): string {
  const percentValue = Math.round(percentile * PERCENT_MULTIPLIER)
  const suffix = getOrdinalSuffix(percentValue)
  return `${percentValue}${suffix}`
}

function getOrdinalSuffix(n: number): string {
  const lastDigit = n % DIVISOR_LAST_DIGIT
  const lastTwoDigits = n % DIVISOR_LAST_TWO_DIGITS
  if (
    lastTwoDigits >= ORDINAL_EXCEPTION_MIN &&
    lastTwoDigits <= ORDINAL_EXCEPTION_MAX
  ) {
    return "th"
  }
  switch (lastDigit) {
    case ORDINAL_FIRST: {
      return "st"
    }
    case ORDINAL_SECOND: {
      return "nd"
    }
    case ORDINAL_THIRD: {
      return "rd"
    }
    default: {
      return "th"
    }
  }
}

/**
 * Returns the tier for a given percentile
 */
function getTierForPercentile(percentile: number): TierThreshold | undefined {
  if (percentile >= PERCENTILE_75) {
    return TIER_THRESHOLDS[TIER_INDEX_TOP]
  }
  if (percentile >= PERCENTILE_50) {
    return TIER_THRESHOLDS[TIER_INDEX_MID]
  }
  if (percentile >= PERCENTILE_25) {
    return TIER_THRESHOLDS[TIER_INDEX_ENTRY]
  }
  return undefined
}

interface PercentileProgressBarProps {
  /** Percentile value between 0 and 1 */
  percentile: number
  /** The raw metric value to display */
  value: number | string
  /** The unit for the metric (e.g., "TFLOPS", "FPS") */
  unit: string
  /** Whether to show the tier badge. Default: true */
  showTier?: boolean
  /** Whether to highlight as winner (green bar). Default: false */
  isWinner?: boolean
}

/**
 * A progress bar that displays percentile ranking with value and optional tier indicator.
 * Matches the styling from GpuMetricsTable.tsx with pink bars.
 */
export function PercentileProgressBar({
  percentile,
  value,
  unit,
  showTier = true,
  isWinner = false,
}: PercentileProgressBarProps): JSX.Element {
  const tier = getTierForPercentile(percentile)
  const percentValue = Math.round(percentile * PERCENT_MULTIPLIER)
  const barClass = isWinner
    ? "progress-bar progress-bar-striped progress-bar-animated overflow-visible"
    : "progress-bar overflow-visible"

  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={percentValue}
      aria-valuemin={0}
      aria-valuemax={PERCENT_MULTIPLIER}
    >
      <div
        className={barClass}
        style={{
          width: `${percentValue}%`,
          minWidth: "fit-content",
        }}
      >
        <span className="px-1 text-nowrap">
          {formatPercentileOrdinal(percentile)} @ {value} {unit}
          {showTier && tier && (
            <>
              {" "}
              <span className="d-none d-md-inline">({tier.label})</span>
              <span className="d-md-none">({tier.shortLabel})</span>
            </>
          )}
        </span>
      </div>
    </div>
  )
}

interface NoDataBarProps {
  message?: string
}

/**
 * Placeholder for when no data is available
 */
export function NoDataBar({
  message = "Data not available",
}: NoDataBarProps): JSX.Element {
  return <span className="text-muted fst-italic">{message}</span>
}
