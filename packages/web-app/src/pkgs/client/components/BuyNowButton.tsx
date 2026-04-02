import { Listing } from "@/pkgs/isomorphic/model"
import { ListingAffiliateLink } from "./ListingAffiliateLink"
import { formatPrice } from "./format"
import { MarketplaceIcon } from "./MarketplaceIcon"

interface BuyNowButtonProps {
  item: Listing
}

export function BuyNowButton({ item }: BuyNowButtonProps): JSX.Element {
  const { itemAffiliateWebUrl, source, priceValue } = item
  const cost = Number(priceValue)
  return (
    <ListingAffiliateLink
      to={itemAffiliateWebUrl}
      listing={item}
      className="btn btn-primary d-flex align-items-center gap-2"
    >
      <MarketplaceIcon source={source} size="small" /> {formatPrice(cost)}
    </ListingAffiliateLink>
  )
}
