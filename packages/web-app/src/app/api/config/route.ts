import { NextResponse } from "next/server"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"

/* eslint-disable import/no-unused-modules */

// Force dynamic to avoid using build-time environment variables.
export const dynamic = "force-dynamic"

interface PublicConfig {
  domain: string
  posthogKey: string
  posthogHost: string
}

export async function GET(): Promise<NextResponse<PublicConfig>> {
  // Validate configuration at request time for fail-fast behavior at runtime
  const config: PublicConfig = {
    domain: ISOMORPHIC_CONFIG.PUBLIC_DOMAIN(),
    posthogKey: ISOMORPHIC_CONFIG.PUBLIC_POSTHOG_KEY(),
    posthogHost: ISOMORPHIC_CONFIG.PUBLIC_POSTHOG_HOST(),
  }

  return NextResponse.json(config, {
    headers: {
      // Cache for 1 hour - config rarely changes
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "application/json",
    },
  })
}
