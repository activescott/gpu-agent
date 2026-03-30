"use client"
import { SvgIcon } from "./SvgIcon"
import type { JSX } from "react"

interface MarketplaceIconProps {
  size?: "xs" | "small" | "medium"
}

/**
 * Renders the eBay logo icon.
 */
export function EbayIcon({
  size = "small",
}: MarketplaceIconProps): JSX.Element {
  // NOTE the special svgViewBox for this icon.
  return <SvgIcon icon="ebay" svgViewBox="0 0 24 9.58" size={size} alt="eBay" />
}
