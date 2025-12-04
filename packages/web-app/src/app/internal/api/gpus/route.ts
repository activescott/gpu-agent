import { NextResponse } from "next/server"
import { listGpus } from "@/pkgs/server/db/GpuRepository"

export async function GET() {
  try {
    const gpus = await listGpus()
    const gpuOptions = gpus
      .map((gpu) => ({ name: gpu.name, label: gpu.label }))
      .sort((a, b) => a.label.localeCompare(b.label))

    return NextResponse.json(gpuOptions)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching GPU list:", error)
    return NextResponse.json(
      { error: "Failed to fetch GPU list" },
      { status: 500 },
    )
  }
}
