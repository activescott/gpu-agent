import { NextResponse } from "next/server"
import { prismaSingleton } from "@/pkgs/server/db/db"

/**
 * Service readiness probe.
 *
 * If this probe fails or times out enough times, Kubernetes removes the
 * pod from load balancer rotation (returning 503 to clients). Unlike
 * liveness, readiness failures do NOT terminate the pod—the pod stays
 * running and can recover when the dependency becomes available again.
 *
 * Check external services that are critical for *every* request. This
 * creates a "circuit breaker" effect: if a dependency is down, the pod
 * stops receiving traffic rather than failing every request.
 *
 * You may NOT want to check all dependencies. For example, if some
 * endpoints use a database while others only use a message queue, don't
 * include the database since the queue-only endpoints can still serve
 * traffic. However, if ALL endpoints require a dependency (database, auth
 * service), include it here. Removing the pod from rotation prevents
 * wasted requests and reduces load on the struggling dependency.
 */
// eslint-disable-next-line import/no-unused-modules
export async function GET() {
  const checks: Record<string, string> = {}

  try {
    await prismaSingleton.$queryRaw`SELECT 1`
    checks["database"] = "ok"
  } catch (error) {
    console.error("Readiness check failed:", error)
    checks["database"] = "failed"
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks,
      },
      { status: 503 },
    )
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    checks,
  })
}
