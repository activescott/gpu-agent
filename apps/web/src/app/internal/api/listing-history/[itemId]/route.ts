import { NextRequest, NextResponse } from "next/server"
import { getListingVersionHistory } from "@/pkgs/server/db/ListingRepository"
import { prismaSingleton } from "@/pkgs/server/db/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } },
) {
  try {
    const itemId = decodeURIComponent(params.itemId)

    const versionHistory = await getListingVersionHistory(
      itemId,
      prismaSingleton,
    )

    return NextResponse.json({
      itemId,
      versionHistory,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching listing version history:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
