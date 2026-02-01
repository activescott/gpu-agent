import { NextResponse } from "next/server"
import { listGpus } from "@/pkgs/server/db/GpuRepository"
import { createLogger } from "@/lib/logger"

const log = createLogger("internal:api:gpus")

export async function GET() {
  try {
    const gpus = await listGpus()
    const gpuOptions = gpus
      .map((gpu) => ({ name: gpu.name, label: gpu.label }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return NextResponse.json(gpuOptions)
  } catch (error) {
    log.error({ err: error }, "Error fetching GPU list")
    return NextResponse.json(
      { error: "Failed to fetch GPU list" },
      { status: 500 },
    )
  }
}
