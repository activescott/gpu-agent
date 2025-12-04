import { NextRequest, NextResponse } from "next/server"
import { getMonthlyAverages } from "@/pkgs/server/db/ListingRepository"
import { prismaSingleton } from "@/pkgs/server/db/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gpuNames, monthYear } = body

    // Validate input
    if (!Array.isArray(gpuNames) || gpuNames.length === 0) {
      return NextResponse.json(
        { error: "gpuNames must be a non-empty array" },
        { status: 400 },
      )
    }

    if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
      return NextResponse.json(
        { error: "monthYear must be in format YYYY-MM" },
        { status: 400 },
      )
    }

    const monthlyStats = await getMonthlyAverages(
      gpuNames,
      monthYear,
      prismaSingleton,
    )

    return NextResponse.json({
      monthYear,
      gpuNames,
      monthlyStats,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching monthly stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
