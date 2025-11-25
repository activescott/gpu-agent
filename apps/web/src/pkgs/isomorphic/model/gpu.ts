import { stripIndents } from "common-tags"
import { z } from "zod"
import { GpuSpecsSchema } from "./specs"
import { GpuBenchmarksSchema } from "./benchmarks"

export const GpuSchema = z
  .object({
    name: z.string(),
    label: z.string(),
    series: z.string().optional().nullable(),
    gpuArchitecture: z.string(),
    supportedHardwareOperations: z.array(z.string()).describe(stripIndents`
      A list of the supported precisions for hardware-accelerated generalized
      matrix multiplication operations (GEMM). Each value indicates a precision
      that is supported. In most cases this won't matter that much as the result
      will be reflected in OPS specs such as @see GpuSpecs.fp32TFLOPS or @see
      GpuSpecs.fp32TFLOPS. However, in some cases such as BF16, it may be less
      than clear that the GPU does or does not support the precision in those
      operations. For example, the Turing and Volta Nvidia architectures support
      FP16, but not BF16.`),
    // .. | nullable because prisma seems to require it for optional fields :/
    supportedCUDAComputeCapability: z.number().optional().nullable(),
    summary: z.string(),
    references: z.array(z.string()),
    // .. | nullable because prisma seems to require it for optional fields :/
    maxTDPWatts: z.number().optional().nullable(),
  })
  .extend(GpuSpecsSchema.shape)
  .extend(GpuBenchmarksSchema.shape)

export type Gpu = z.infer<typeof GpuSchema>
