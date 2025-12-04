import { NextResponse } from "next/server"

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
