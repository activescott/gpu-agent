import { Metadata } from "next"
import ClientRedirect from "./ClientRedirect"

// Must be dynamic because we need the searchParam: https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function Page() {
  // this page is meant to be used for tracking users that transition to a revenue-generating affiliate link. It was asked for by adwords.
  return <ClientRedirect />
}
