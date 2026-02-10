import { NextRequest, NextResponse } from "next/server"
import { SERVER_CONFIG } from "@/pkgs/isomorphic/config"
import { createLogger } from "@/lib/logger"

const log = createLogger("middleware:internal-auth")

// eslint-disable-next-line import/no-unused-modules -- Next.js middleware convention
export function middleware(request: NextRequest) {
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
  matcher: ["/internal/:path*"],
}
