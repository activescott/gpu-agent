import { z } from "zod"

export const GpuBenchmarksSchema = z.object({
  // Counter-Strike 2 benchmarks at different resolutions
  counterStrike2Fps3840x2160: z.number().optional().nullable(),
  counterStrike2Fps2560x1440: z.number().optional().nullable(),
  counterStrike2Fps1920x1080: z.number().optional().nullable(),
  // 3DMark Wild Life Extreme benchmark
  "3dmarkWildLifeExtremeFps": z.number().optional().nullable(),
})

export type GpuBenchmarks = z.infer<typeof GpuBenchmarksSchema>

export type GpuBenchmarkKey = keyof GpuBenchmarks

export const GpuBenchmarkKeys: GpuBenchmarkKey[] = [
  "counterStrike2Fps3840x2160",
  "counterStrike2Fps2560x1440",
  "counterStrike2Fps1920x1080",
  "3dmarkWildLifeExtremeFps",
]

interface GpuBenchmarkItem {
  label: string
  unit: string
  unitShortest: string
  description: string
  descriptionDollarsPer: string
  category: "ai" | "gaming"
}

export const GpuBenchmarksDescription: Record<
  GpuBenchmarkKey,
  GpuBenchmarkItem
> = {
  counterStrike2Fps3840x2160: {
    label: "Counter-Strike 2 FPS (4K)",
    unit: "FPS",
    unitShortest: "FPS",
    description:
      "Average frames per second in Counter-Strike 2 at 3840x2160 resolution (4K). Higher FPS means smoother gameplay.",
    descriptionDollarsPer:
      "Dollars per FPS indicates how much you pay for each frame per second. Lower is better.",
    category: "gaming",
  },
  counterStrike2Fps2560x1440: {
    label: "Counter-Strike 2 FPS (1440p)",
    unit: "FPS",
    unitShortest: "FPS",
    description:
      "Average frames per second in Counter-Strike 2 at 2560x1440 resolution (1440p). Higher FPS means smoother gameplay.",
    descriptionDollarsPer:
      "Dollars per FPS indicates how much you pay for each frame per second. Lower is better.",
    category: "gaming",
  },
  counterStrike2Fps1920x1080: {
    label: "Counter-Strike 2 FPS (1080p)",
    unit: "FPS",
    unitShortest: "FPS",
    description:
      "Average frames per second in Counter-Strike 2 at 1920x1080 resolution (1080p). Higher FPS means smoother gameplay.",
    descriptionDollarsPer:
      "Dollars per FPS indicates how much you pay for each frame per second. Lower is better.",
    category: "gaming",
  },
  "3dmarkWildLifeExtremeFps": {
    label: "3DMark Wild Life Extreme",
    unit: "FPS",
    unitShortest: "FPS",
    description:
      "Average frames per second in 3DMark Wild Life Extreme benchmark, a cross-platform GPU benchmark for gaming performance.",
    descriptionDollarsPer:
      "Dollars per FPS indicates how much you pay for each frame per second. Lower is better.",
    category: "gaming",
  },
}
