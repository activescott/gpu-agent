export interface GpuSpecs {
  tensorCoreCount: number
  fp32TFLOPS: number
  fp16TFLOPS: number
  int8TOPS: number
  memoryCapacityGB: number
  memoryBandwidthGBs: number
}

export type GpuSpecKey = keyof GpuSpecs

export const GpuSpecKeys: GpuSpecKey[] = [
  "tensorCoreCount",
  "fp32TFLOPS",
  "fp16TFLOPS",
  "int8TOPS",
  "memoryCapacityGB",
  "memoryBandwidthGBs",
]

interface GpuSpecItem {
  label: string
  unit: string
  description: string
  descriptionDollarsPer: string
}

export const GpuSpecsDescription: Record<GpuSpecKey, GpuSpecItem> = {
  tensorCoreCount: {
    label: "Tensor Core Count",
    unit: "Tensor Core",
    description:
      "Tensor Cores are processors that perform efficient matrix multiplication, and are very useful for deep neural networks.",
    descriptionDollarsPer: "How much you pay per tensor core. Lower is better.",
  },
  fp32TFLOPS: {
    label: "FP32 TFLOPs",
    unit: "FP32 TFLOPs",
    description:
      "The number of 32-bit floating-point operations per second the card can perform in trillions.",
    descriptionDollarsPer:
      "Dollars per 32-bit floating-point operations per second indicates how much you pay for each trillion operations per second. Lower is better.",
  },
  fp16TFLOPS: {
    label: "FP16 TFLOPs",
    unit: "FP16 TFLOPs",
    description:
      "The number of 16-bit operations per second the card can perform in trillions.",
    descriptionDollarsPer:
      "Dollars per 16-bit floating-point operations per second indicates how much you pay for each trillion operations per second. Lower is better",
  },
  int8TOPS: {
    label: "Int8 TOPs",
    unit: "Int8 TOPs",
    description:
      "The number of 8-bit operations per second the card can perform in trillions.",
    descriptionDollarsPer:
      "Dollars per 8-bit integer operations per second indicates how much you pay for each trillion operations per second. Lower is better.",
  },
  memoryCapacityGB: {
    label: "Memory Capacity (GB)",
    unit: "GB",
    description: "The amount of memory the card has in gigabytes.",
    descriptionDollarsPer:
      "Dollars-per-gigabyte is how much you pay for each GB of memory capacity. Lower is better.",
  },
  memoryBandwidthGBs: {
    label: "Memory Bandwidth (GB/s)",
    unit: "GB/s",
    description:
      "The rate that data can be transferred between memory and the processor in gigabytes per second.",
    descriptionDollarsPer:
      "Dollars-per-gigabyte per-second is how much you're pay for each GBs of memory bandwidth. Lower is better.",
  },
}
