const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

// eslint-disable-next-line import/no-unused-modules -- it is used in an mdx page.
export const FormatCurrency = ({
  currencyValue,
}: {
  currencyValue: number
}) => {
  return <span>{fmt.format(currencyValue)}</span>
}
