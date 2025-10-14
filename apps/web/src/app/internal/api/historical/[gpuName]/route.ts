import { NextRequest, NextResponse } from "next/server"
import {
  getHistoricalPriceData,
  getAvailabilityTrends,
  getPriceVolatility,
} from "@/pkgs/server/db/ListingRepository"
import { prismaSingleton } from "@/pkgs/server/db/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { gpuName: string } },
) {
  try {
    const { searchParams } = new URL(request.url)
    const months = Number.parseInt(searchParams.get("months") || "6", 10)
    const gpuName = decodeURIComponent(params.gpuName)

    // Validate months parameter
    if (months < 1 || months > 24) {
      return NextResponse.json(
        { error: "Months parameter must be between 1 and 24" },
        { status: 400 },
      )
    }

    const [priceHistory, availabilityTrends, volatilityStats] =
      await Promise.all([
        getHistoricalPriceData(gpuName, months, prismaSingleton),
        getAvailabilityTrends(gpuName, months, prismaSingleton),
        getPriceVolatility(gpuName, months, prismaSingleton),
      ])

    return NextResponse.json({
      gpuName,
      months,
      priceHistory,
      availabilityTrends,
      volatilityStats,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching historical data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
