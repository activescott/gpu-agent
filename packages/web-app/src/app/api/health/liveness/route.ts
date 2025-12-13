import { NextResponse } from "next/server"

/**
 * Service liveness probe.
 *
 * If this probe fails or times out enough times, Kubernetes will terminate
 * the pod. We explicitly avoid checking external services here. Liveness
 * should only detect pod-specific problems such as deadlocks or
 * unrecoverable internal errors - not external dependency failures.
 */
// eslint-disable-next-line import/no-unused-modules
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
}
