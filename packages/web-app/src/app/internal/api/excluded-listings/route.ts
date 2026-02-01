import { NextResponse } from "next/server"
import {
  listExcludedListings,
  getExclusionStats,
} from "@/pkgs/server/db/ListingRepository"
import { createLogger } from "@/lib/logger"

const log = createLogger("internal:api:excluded-listings")

const DEFAULT_PAGINATION_LIMIT = 100

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get("reason") || undefined
    const gpuName = searchParams.get("gpuName") || undefined
    const limit = searchParams.get("limit")
      ? Number.parseInt(searchParams.get("limit")!)
      : DEFAULT_PAGINATION_LIMIT
    const offset = searchParams.get("offset")
      ? Number.parseInt(searchParams.get("offset")!)
      : 0

    const [{ listings, total }, stats] = await Promise.all([
      listExcludedListings({ reason, gpuName, limit, offset }),
      getExclusionStats(),
    ])

    // Convert listings to a simpler format for the frontend
    const formattedListings = listings.map((listing) => ({
      itemId: listing.itemId,
      title: listing.title,
      priceValue: listing.priceValue,
      gpuName: listing.gpu.name,
      gpuLabel: listing.gpu.label,
      cachedAt: listing.cachedAt.toISOString(),
      condition: listing.condition,
      sellerUsername: listing.sellerUsername,
      sellerFeedbackPercentage: listing.sellerFeedbackPercentage,
      itemAffiliateWebUrl: listing.itemAffiliateWebUrl,
    }))

    return NextResponse.json({
      listings: formattedListings,
      total,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: offset + listings.length < total,
      },
    })
  } catch (error) {
    log.error({ err: error }, "Error fetching excluded listings")
    return NextResponse.json(
      { error: "Failed to fetch excluded listings" },
      { status: 500 },
    )
  }
}
