import { ReactNode } from "react"

export const AttributePill = ({
  children,
  tooltip,
  className = "",
}: {
  children: ReactNode
  tooltip?: string
  className?: string
}) => {
  return (
    <span
      className={`badge rounded-pill text-bg-inverse mx-1 ${className}`}
      title={tooltip}
    >
      {children}
    </span>
  )
}

export const CountryPill = ({ isoCountryCode }: { isoCountryCode: string }) => {
  const emojiFlag = emojiFlagForCountryCode(isoCountryCode)
  return (
    <AttributePill>
      <abbr title={countryCodeToCountryName(isoCountryCode)}>{emojiFlag}</abbr>
    </AttributePill>
  )
}
function emojiFlagForCountryCode(isoCountryCode: string): string {
  // 🤯 https://dev.to/jorik/country-code-to-flag-emoji-a21
  const UNICODE_LETTER_A = 127_397
  const codePoints = isoCountryCode
    .toUpperCase()
    // eslint-disable-next-line unicorn/prefer-spread
    .split("")
    .map((char) => char.codePointAt(0)! + UNICODE_LETTER_A)
  return String.fromCodePoint(...codePoints)
}

const formatCountryCodeToCountry = new Intl.DisplayNames(["en"], {
  type: "region",
})
function countryCodeToCountryName(isoCountryCode: string): string {
  return formatCountryCodeToCountry.of(isoCountryCode) || isoCountryCode
}
