"use client"
import { BootstrapIcon } from "./BootstrapIcon"
import type { ListingSource } from "@/pkgs/isomorphic/model/listing"
import type { JSX } from "react"
import { EbayIcon } from "./EbayIcon"

interface MarketplaceIconProps {
  source?: ListingSource
  size?: "xs" | "small" | "medium"
}

/**
 * Renders the marketplace icon (eBay or Amazon) for a listing.
 */
export function MarketplaceIcon({
  source,
  size = "xs",
}: MarketplaceIconProps): JSX.Element {
  if (source === "amazon") {
    return <BootstrapIcon icon="amazon" size={size} alt="Amazon" />
  }
  // force it to at least small size for ebay since the svg is less detailed and
  // doesn't look good at xs size. This mostly true on the "Buy" buttons in listings
  size = size === "xs" ? "small" : size
  return <EbayIcon />
}
