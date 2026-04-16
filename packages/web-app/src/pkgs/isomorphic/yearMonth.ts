const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const

const MONTH_NAME_TO_NUMBER: Map<string, number> = new Map(
  MONTH_NAMES.map((name, index) => [name, index + 1]),
)

const EARLIEST_YEAR = 2026
const EARLIEST_MONTH = 1
const LAST_MONTH = 12
const PARSE_RADIX = 10
const ISO_MONTH_PAD = 2

export interface YearMonth {
  year: number
  month: number
  isoMonth: string
  slug: string
  display: string
}

/**
 * Parses a URL slug like "march-2026" into a YearMonth, or returns null if invalid.
 */
export function parseYearMonthSlug(slug: string): YearMonth | null {
  const match = slug.match(/^([a-z]+)-(\d{4})$/)
  if (!match) return null

  const [, monthName, yearStr] = match
  const year = Number.parseInt(yearStr, PARSE_RADIX)
  const month = MONTH_NAME_TO_NUMBER.get(monthName)
  if (!month) return null

  if (!isValidYearMonth(year, month)) return null

  return buildYearMonth(year, month)
}

/**
 * Formats a year and month number into a URL slug like "march-2026".
 */
export function formatYearMonthSlug(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]}-${year}`
}

/**
 * Formats a year and month number into a display string like "March 2026".
 */
function formatYearMonthDisplay(year: number, month: number): string {
  const name = MONTH_NAMES[month - 1]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}

/**
 * Returns true if the year/month is >= Jan 2026 and the month has started (1st <= today).
 */
function isValidYearMonth(year: number, month: number): boolean {
  if (year < EARLIEST_YEAR) return false
  if (year === EARLIEST_YEAR && month < EARLIEST_MONTH) return false
  if (month < 1 || month > LAST_MONTH) return false

  const now = new Date()
  const firstOfMonth = new Date(year, month - 1, 1)
  return firstOfMonth <= now
}

/**
 * Returns all valid year-month combinations from Jan 2026 through the current month.
 */
export function listValidYearMonths(): YearMonth[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const results: YearMonth[] = []

  for (let year = EARLIEST_YEAR; year <= currentYear; year++) {
    const startMonth = year === EARLIEST_YEAR ? EARLIEST_MONTH : 1
    const endMonth = year === currentYear ? currentMonth : LAST_MONTH
    for (let month = startMonth; month <= endMonth; month++) {
      results.push(buildYearMonth(year, month))
    }
  }

  return results
}

/**
 * Returns the YearMonth for the current month.
 */
export function getCurrentYearMonth(): YearMonth {
  const now = new Date()
  return buildYearMonth(now.getFullYear(), now.getMonth() + 1)
}

function buildYearMonth(year: number, month: number): YearMonth {
  return {
    year,
    month,
    isoMonth: `${year}-${String(month).padStart(ISO_MONTH_PAD, "0")}`,
    slug: formatYearMonthSlug(year, month),
    display: formatYearMonthDisplay(year, month),
  }
}
