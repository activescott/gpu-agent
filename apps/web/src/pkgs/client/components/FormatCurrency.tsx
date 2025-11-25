const fmtDec = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const fmtInteger = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// eslint-disable-next-line import/no-unused-modules -- it is used in an mdx page.
export const FormatCurrency = ({
  value,
  currencyValue,
  forceInteger,
}: {
  value?: number
  currencyValue?: number
  forceInteger?: boolean
}) => {
  // Support both 'value' and 'currencyValue' prop names for backwards compatibility
  const amount = value === undefined ? currencyValue : value

  // Handle cases where price data is not available
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return <span className="text-muted">n/a</span>
  }

  return (
    <span>
      {forceInteger ? fmtInteger.format(amount) : fmtDec.format(amount)}
    </span>
  )
}
