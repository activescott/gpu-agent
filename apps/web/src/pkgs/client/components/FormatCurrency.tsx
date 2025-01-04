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
  currencyValue,
  forceInteger,
}: {
  currencyValue: number
  forceInteger?: boolean
}) => {
  return (
    <span>
      {forceInteger
        ? fmtInteger.format(currencyValue)
        : fmtDec.format(currencyValue)}
    </span>
  )
}
