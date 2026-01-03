/**
 * Chart Image API Route
 *
 * Renders chart images dynamically based on component name and date range.
 *
 * URL format: /api/images/chart/{componentName}?from={YYYY-MM}&to={YYYY-MM}
 * Example: /api/images/chart/ScalperPremiumChart?from=2026-01&to=2026-01
 */
import { NextRequest, NextResponse } from "next/server"
import { composeChartImage } from "@/pkgs/server/charts"
import {
  chartConfigFetchers,
  CHART_COMPONENT_NAMES,
  parseDateRange,
} from "@/pkgs/server/components/charts"

// Use Node.js runtime for canvas rendering
export const runtime = "nodejs"

// Cache for 1 hour, stale-while-revalidate for 1 day
export const revalidate = 3600

interface ChartParams {
  params: Promise<{ componentName: string }>
}

/**
 * GET /api/images/chart/[componentName]
 *
 * Query parameters:
 * - from: Start month (YYYY-MM format)
 * - to: End month (YYYY-MM format)
 */
// eslint-disable-next-line import/no-unused-modules
export async function GET(
  request: NextRequest,
  { params }: ChartParams,
): Promise<NextResponse> {
  const { componentName } = await params
  const { searchParams } = new URL(request.url)

  // Validate component name
  if (!CHART_COMPONENT_NAMES.includes(componentName)) {
    return NextResponse.json(
      {
        error: `Unknown chart component: ${componentName}`,
        available: CHART_COMPONENT_NAMES,
      },
      { status: 404 },
    )
  }

  // Get date range from query params
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing required query parameters: from, to (YYYY-MM format)" },
      { status: 400 },
    )
  }

  // Validate date format
  const datePattern = /^\d{4}-\d{2}$/
  if (!datePattern.test(from) || !datePattern.test(to)) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM (e.g., 2026-01)" },
      { status: 400 },
    )
  }

  try {
    const dateRange = { from, to }

    // Get the config fetcher for this component
    const fetcher = chartConfigFetchers[componentName]
    if (!fetcher) {
      return NextResponse.json(
        { error: `No fetcher found for: ${componentName}` },
        { status: 500 },
      )
    }

    // Fetch the chart configuration
    const config = await fetcher(dateRange)

    // Parse date for footer
    const { endDate } = parseDateRange(to)

    // Render the chart image
    const imageBuffer = await composeChartImage(config, {
      title: config.title,
      date: endDate,
    })

    // Return PNG with caching headers
    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(imageBuffer.length),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error(`Error rendering chart ${componentName}:`, error)
    return NextResponse.json(
      { error: "Failed to render chart image" },
      { status: 500 },
    )
  }
}
