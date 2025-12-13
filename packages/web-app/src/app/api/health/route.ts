import { NextResponse } from "next/server"

/**
 * @deprecated Use /api/health/liveness or /api/health/readiness instead.
 * This endpoint is maintained only for backwards compatibility with old
 * k8s resources. It behaves like a liveness probe (no external dependency
 * checks). Remove once all k8s deployments are updated to use the new
 * endpoints.
 */
// eslint-disable-next-line import/no-unused-modules
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "gpu-agent",
    },
    {
      status: 200,
    },
  )
}
