import { listGpus } from "@/pkgs/server/db/GpuRepository"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const gpus = await listGpus()
  const data = gpus.map((gpu) => ({
    name: gpu.name,
    label: gpu.label,
    series: gpu.series ?? null,
    category: gpu.category ?? null,
    memoryCapacityGB: gpu.memoryCapacityGB,
    fp32TFLOPS: gpu.fp32TFLOPS,
  }))
  return NextResponse.json(data)
}
