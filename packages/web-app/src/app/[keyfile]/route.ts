import { NextRequest, NextResponse } from "next/server"

/* eslint-disable import/no-unused-modules */

/**
 * IndexNow key file route handler.
 *
 * IndexNow requires a key file to be hosted at the root of the domain
 * (e.g., https://gpupoet.com/{key}.txt) to verify ownership.
 *
 * This route dynamically serves the key from the INDEXNOW_API_KEY environment variable.
 */

// The IndexNow key - must match INDEXNOW_API_KEY env var used by the notifier
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY ?? ""

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ keyfile: string }> },
): Promise<NextResponse> {
  const { keyfile } = await params

  // Only respond to requests for .txt files
  if (!keyfile.endsWith(".txt")) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // If no key is configured, return 404
  if (!INDEXNOW_KEY) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // Extract the key from the filename (remove .txt extension)
  const requestedKey = keyfile.slice(0, -4)

  // Verify the requested key matches our key
  if (requestedKey !== INDEXNOW_KEY) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // Return the key as plain text (IndexNow requirement)
  return new NextResponse(INDEXNOW_KEY, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Cache for 1 day, but allow revalidation
      "Cache-Control": "public, max-age=86400, must-revalidate",
    },
  })
}
