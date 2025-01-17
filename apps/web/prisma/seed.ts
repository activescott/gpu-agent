/* eslint-disable no-console, import/no-unused-modules */
import { Prisma, PrismaClient } from "@prisma/client"
import yaml from "yaml"
import _ from "lodash"
import path from "path"
import fs from "fs/promises"
import { GpuSchema } from "@/pkgs/isomorphic/model"
import * as dotenv from "dotenv"
import { NewsArticle, NewsArticleSchema } from "@/pkgs/isomorphic/model/news"

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, "../.env.local") })

const { isNil } = _

async function main() {
  const prisma = new PrismaClient()

  try {
    await seedNews(prisma)
    await seedGpus(prisma)
  } catch (error) {
    console.error(error)
    throw new Error("Error seeding data", { cause: error })
  } finally {
    await prisma.$disconnect()
  }
}

async function seedNews(prisma: PrismaClient): Promise<void> {
  const newsDataDir = path.resolve(__dirname, "../../../data/news-data")
  console.info(`seeing news articles from ${newsDataDir}...`)

  const newsPaths = await fs.readdir(newsDataDir)

  const newsFiles = newsPaths
    .filter((file) => {
      const isYaml = file.endsWith(".yaml")
      if (!isYaml) {
        console.warn(`Skipping file ${file} because it is not a YAML file`)
      }
      return isYaml
    })
    .map((f) => path.join(newsDataDir, f))

  const newsPromises = newsFiles.map(async (filePath) => {
    const contents = await fs.readFile(filePath, "utf8")
    const newsData = yaml.parse(contents)

    // Validate the news data against the schema
    try {
      return NewsArticleSchema.parse(newsData) as NewsArticle
    } catch (error) {
      console.error(`Error validating news data in ${filePath}:`, error)
      throw error
    }
  })

  const news = await Promise.all(newsPromises)
  console.debug(
    `Loaded ${news.length} news articles from YAML files:`,
    news.map((n) => `${n.id} (${n.title})`),
  )

  for (const newsItem of news) {
    // if id and updatedAt are the same, we'll ignore it. otherwise we'll update it
    const where: Prisma.NewsArticleWhereInput = {
      id: newsItem.id,
      updatedAt: newsItem.updatedAt,
    }

    const newsCount = await prisma.newsArticle.count({
      where,
    })

    if (newsCount > 0) {
      console.warn(
        `skipping news item with same values ${newsItem.id} (${newsItem.title}).`,
      )
      continue
    }

    console.info(
      `upserting news item ${newsItem.id} (${newsItem.title}) with different values...`,
    )

    await prisma.newsArticle.upsert({
      where: { id: newsItem.id },
      update: newsItem,
      create: newsItem,
    })
    console.info(
      `upserting news item ${newsItem.id} (${newsItem.title}) complete.`,
    )
  }
}

async function seedGpus(prisma: PrismaClient): Promise<void> {
  const gpuDataDir = path.resolve(__dirname, "../../../data/gpu-data")
  const gpuFilesUnfiltered = await fs.readdir(gpuDataDir)
  const gpuFiles = gpuFilesUnfiltered
    .filter((file) => {
      const isYaml = file.endsWith(".yaml")
      if (!isYaml) {
        console.warn(`Skipping file ${file} because it is not a YAML file`)
      }
      return isYaml
    })
    .map((file) => path.join(gpuDataDir, file))

  const gpus = []

  for (const filePath of gpuFiles) {
    const contents = await fs.readFile(filePath, "utf8")
    const gpuData = yaml.parse(contents)

    // Validate the GPU data against the schema
    try {
      const validatedGpu = GpuSchema.parse(gpuData)
      gpus.push(validatedGpu)
    } catch (error) {
      console.error(`Error validating GPU data in ${filePath}:`, error)
      throw new Error("Error validating GPU data", { cause: error })
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
  .then(async () => {})
  .catch(async (error) => {
    console.error(error)
    /* eslint-disable unicorn/no-process-exit -- because this is a CLI script */
    process.exit(1)
  })
