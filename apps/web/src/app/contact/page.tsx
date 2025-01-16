import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact CoinPoet.com",
  description: `Contact Coin Poet. Have a question, suggestion, or want to report a bug? Let us know!`,
}

export default function Page(): JSX.Element {
  return (
    <iframe
      src="https://docs.google.com/forms/d/e/1FAIpQLSdvJyqpXoorSni0l_JjdaQ74M2xrQ3CLhm-fyP7gU5QTTQ5Xw/viewform?embedded=true"
      className="w-100"
      height="1900"
    >
      Loading…
    </iframe>
  )
}
