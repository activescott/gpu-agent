import Link from "next/link"
import { AnalyticsActions, useAnalytics } from "../analytics/reporter"
import { Listing } from "@/pkgs/isomorphic/model"

interface AffiliateLinkProps {
  to: string
  listing: Listing
  className?: string
  children: React.ReactNode
}

export function ListingAffiliateLink({
  to,
  children,
  className,
  listing,
}: AffiliateLinkProps) {
  const analytics = useAnalytics()
  return (
    <Link
      href={`/bye?to=${encodeURIComponent(to)}`}
      onClick={() => {
        analytics.trackAction(AnalyticsActions.BuyNow, {
          "listing-id": listing.itemId,
          "gpu-name": listing.gpu.name,
          "listing-price": listing.priceValue,
        })
      }}
      className={className}
    >
      {children}
    </Link>
  )
}
