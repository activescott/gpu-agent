import Link from "next/link"
import { AnalyticsActions, useAnalytics } from "../analytics/reporter"
import { Listing } from "@/pkgs/isomorphic/model"

interface AffiliateLinkProps {
  to: string
  listing: Listing
  className?: string
  children: React.ReactNode
}

/**
 * Returns the affiliate link + analytics tracking for the specified listing.
 * NOTE: Be careful that this link is always clearly marked according to EPN
 *   Code of Conduct they require "It must be clear for end users where they are
 *   being directed at all times." per
 *   https://partnernetwork.ebay.com/page/network-agreement#prohibited and they
 *   contacted me for violation on this before when it wasn't super obvious (it
 *   also wasn't flagrantly misleading).
 */
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
      prefetch={false}
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
