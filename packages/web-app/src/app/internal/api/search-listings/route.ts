import { NextResponse } from "next/server"
import { searchActiveListings } from "@/pkgs/server/db/ListingRepository"
import { createLogger } from "@/lib/logger"

const log = createLogger("internal:api:search-listings")

const DEFAULT_PAGINATION_LIMIT = 50

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 },
      )
    }

    const limitParam = searchParams.get("limit")
    const limit = limitParam
      ? Number.parseInt(limitParam)
      : DEFAULT_PAGINATION_LIMIT
    const offsetParam = searchParams.get("offset")
    const offset = offsetParam ? Number.parseInt(offsetParam) : 0

    const { listings, total } = await searchActiveListings(query.trim(), {
      limit,
      offset,
    })

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
      pagination: {
        limit,
        offset,
        hasMore: offset + listings.length < total,
      },
    })
  } catch (error) {
    log.error({ err: error }, "Error searching listings")
    return NextResponse.json(
      { error: "Failed to search listings" },
      { status: 500 },
    )
  }
}
