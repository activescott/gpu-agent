import { NextRequest, NextResponse } from "next/server"
import { SERVER_CONFIG } from "@/pkgs/isomorphic/config"
import { createLogger } from "@/lib/logger"

const log = createLogger("middleware")

const POSTHOG_INGESTION_HOST = "https://us.i.posthog.com"

// eslint-disable-next-line import/no-unused-modules -- Next.js middleware convention
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/a/")) {
    return handlePostHogProxy(request)
  }
  return handleInternalAuth(request)
}

/**
 * Proxy PostHog ingestion requests, forwarding the real client IP via
 * X-Forwarded-For so PostHog can geo-locate visitors correctly.
 * Replaces the next.config.mjs rewrite which lost the client IP.
 */
async function handlePostHogProxy(request: NextRequest): Promise<Response> {
  const pathname = request.nextUrl.pathname.replace(/^\/a/, "")
  const search = request.nextUrl.search
  const destination = `${POSTHOG_INGESTION_HOST}${pathname}${search}`

  const headers = new Headers(request.headers)
  // Traefik sets X-Forwarded-For with the real client IP; forward it to PostHog.
  const clientIp = request.headers.get("x-forwarded-for") ?? "unknown"
  headers.set("X-Forwarded-For", clientIp)
  // Remove host header so it isn't sent as the K8s internal hostname
  headers.delete("host")

  return fetch(destination, {
    method: request.method,
    headers,
    body: request.method === "GET" ? undefined : request.body,
    // @ts-expect-error -- duplex is required for streaming request bodies in Node but not in the TS types yet
    duplex: "half",
  })
}

function handleInternalAuth(request: NextRequest) {
  let username: string
  let password: string
  try {
    username = SERVER_CONFIG.ADMIN_USERNAME()
    password = SERVER_CONFIG.ADMIN_PASSWORD()
  } catch (error) {
    log.error({ err: error }, "Internal auth middleware configuration error")
    return new NextResponse("Internal Server Error", { status: 500 })
  }

  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Internal"' },
    })
  }

  const base64Credentials = authHeader.slice("Basic ".length)
  let decoded: string
  try {
    decoded = atob(base64Credentials)
  } catch {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Internal"' },
    })
  }

  const separatorIndex = decoded.indexOf(":")
  if (separatorIndex === -1) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Internal"' },
    })
  }

  const providedUsername = decoded.slice(0, separatorIndex)
  const providedPassword = decoded.slice(separatorIndex + 1)

  if (providedUsername !== username || providedPassword !== password) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Internal"' },
    })
  }

  return NextResponse.next()
}

// eslint-disable-next-line import/no-unused-modules -- Next.js middleware convention
export const config = {
  matcher: ["/internal/:path*", "/a/:path*"],
}
