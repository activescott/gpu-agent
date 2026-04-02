"use client"
import { SvgIcon } from "./SvgIcon"
import type { JSX } from "react"

/**
 * Renders the eBay logo icon.
 */
export function EbayIcon(): JSX.Element {
  // NOTE the special svgViewBox for this icon.
  return (
    <SvgIcon icon="ebay" svgViewBox="0 0 24 9.58" height="16px" alt="eBay" />
  )
}
