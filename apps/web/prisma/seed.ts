/* eslint-disable no-console, import/no-unused-modules */
import { PrismaClient } from "@prisma/client"
import yaml from "yaml"
import _ from "lodash"
import path from "path"
import fs from "fs/promises"
import { GpuSchema } from "../src/pkgs/isomorphic/model"
import * as dotenv from "dotenv"

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, "../.env.local") })

const { isNil } = _

const prisma = new PrismaClient()

async function main() {
  const gpuDataDir = path.join(__dirname, "../../data/gpu-data")
  const gpuFiles = await fs.readdir(gpuDataDir)
  const gpus = []

  for (const file of gpuFiles) {
    if (!file.endsWith(".yaml")) {
      console.warn(`Skipping file ${file} because it is not a YAML file`)
      continue
    }

    const filePath = path.join(gpuDataDir, file)
    const fileContents = await fs.readFile(filePath, "utf8")
    const gpuData = yaml.parse(fileContents)

    // Validate the GPU data against the schema
    try {
      const validatedGpu = GpuSchema.parse(gpuData)
      gpus.push(validatedGpu)
    } catch (error) {
      console.error(`Error validating GPU data in ${file}:`, error)
      throw error
    }
  }

  console.log(`Loaded ${gpus.length} GPUs from YAML files`)

  for (const gpu of gpus) {
    // TODO: should build this were clause dynamically based on the keys in the zod GPUSchema
    // we don't want to update anything if the values haven't changed because it updates the "updatedAt" timestamp used in the sitemap.
    const where = {
      name: gpu.name,
      label: gpu.label,
      tensorCoreCount: gpu.tensorCoreCount,
      fp32TFLOPS: gpu.fp32TFLOPS,
      fp16TFLOPS: gpu.fp16TFLOPS,
      int8TOPS: gpu.int8TOPS,
      memoryCapacityGB: gpu.memoryCapacityGB,
      memoryBandwidthGBs: gpu.memoryBandwidthGBs,
      maxTDPWatts: gpu.maxTDPWatts,
      gpuArchitecture: gpu.gpuArchitecture,
      // prisma doesn't like it when these nullable list args are undefined, so we have to catch that here:
      references: isNil(gpu.references)
        ? { equals: null }
        : { equals: gpu.references },
      supportedHardwareOperations: isNil(gpu.supportedHardwareOperations)
        ? { equals: null }
        : { equals: gpu.supportedHardwareOperations },
      supportedCUDAComputeCapability: gpu.supportedCUDAComputeCapability,
      summary: gpu.summary,
    }
    const gpuCount = await prisma.gpu.count({
      where,
    })
    if (gpuCount > 0) {
      console.log("skipping gpu", gpu.name, "with same values.")
      continue
    }
    console.log("upserting gpu", gpu.name, "with different values...")
    await prisma.gpu.upsert({
      where: { name: gpu.name },
      update: gpu,
      create: gpu,
    })
    console.log("upserting gpu", gpu.name, "complete.")
  }
}

/* eslint-disable unicorn/prefer-top-level-await -- because this file's tsconfig is unexpected (maybe this could be fixed with another tsconfig in the same dir?) */
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    /* eslint-disable unicorn/no-process-exit -- because this is a CLI script */
    await prisma.$disconnect()
    process.exit(1)
  })
