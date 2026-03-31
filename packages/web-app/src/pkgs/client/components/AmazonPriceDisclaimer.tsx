"use client"
import type { JSX } from "react"
import type { ListingSource } from "@/pkgs/isomorphic/model/listing"

interface AmazonPriceDisclaimerProps {
  source?: ListingSource
  cachedAt?: Date | string
}

const DISCLAIMER_TEXT =
  "Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon.com at the time of purchase will apply to the purchase of this product."

function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
}

/**
 * Displays the Amazon-required price timestamp and disclaimer.
 * Only renders for Amazon listings. Shows nothing for eBay.
 */
export function AmazonPriceDisclaimer({
  source,
  cachedAt,
}: AmazonPriceDisclaimerProps): JSX.Element | null {
  if (source !== "amazon" || !cachedAt) return null

  return (
    <div
      className="text-muted mt-1"
      style={{ fontSize: "0.65rem", lineHeight: 1.3 }}
    >
      <span title={DISCLAIMER_TEXT}>
        Amazon.com price as of {formatTimestamp(cachedAt)}. Prices may change.
      </span>
    </div>
  )
}
