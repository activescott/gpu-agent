/* eslint-disable no-console, import/no-unused-modules */
import { Prisma, PrismaClient } from "@prisma/client"
import yaml from "yaml"
import _ from "lodash"
import path from "path"
import fs from "fs/promises"
import { z } from "zod"
import { GpuSchema } from "@/pkgs/isomorphic/model"
import * as dotenv from "dotenv"
import { NewsArticle, NewsArticleSchema } from "@/pkgs/isomorphic/model/news"

const __dirname = path.dirname(new URL(import.meta.url).pathname)

dotenv.config({ path: path.join(__dirname, "../.env.local") })

const { isNil } = _

// Schema for spec metric definitions from specs.yaml
const SpecMetricDefinitionSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.enum(["ai", "gaming"]),
  metricType: z.literal("spec"),
  unit: z.string(),
  unitShortest: z.string(),
  description: z.string(),
  descriptionDollarsPer: z.string(),
  gpuField: z.string(),
})

const SpecsYamlSchema = z.object({
  metrics: z.array(SpecMetricDefinitionSchema),
})

// Schema for benchmark data from YAML files
const BenchmarkDataSchema = z.object({
  // PRIMARY IDENTIFIER - URL-friendly slug used throughout the web app
  // Format: {game-name}-fps-{resolution} (e.g., "counter-strike-2-fps-3840x2160")
  metricSlug: z.string(),
  // GROUPING IDENTIFIER - Short ID for the benchmark program/game
  benchmarkId: z.string(),
  benchmarkName: z.string(),
  configuration: z.string(),
  // SOURCE PROVENANCE - OpenBenchmarking's internal configuration ID
  configurationId: z.string(),
  metricName: z.string(),
  unit: z.string(),
  unitShortest: z.string(),
  description: z.string(),
  descriptionDollarsPer: z.string(),
  category: z.enum(["ai", "gaming"]),
  collectedSamples: z.number(),
  updatedAt: z.string(),
  results: z.array(
    z.object({
      gpuNameRaw: z.string(),
      gpuNameMapped: z.string().optional(),
      value: z.number(),
    }),
  ),
})

type BenchmarkData = z.infer<typeof BenchmarkDataSchema>

async function main() {
  const prisma = new PrismaClient()

  try {
    await seedNews(prisma)
    await seedGpus(prisma)
    // Note: seedBenchmarks() has been removed - benchmark values are now
    // stored in the GpuMetricValue table and seeded via seedGpuMetricValues()
    await seedMetricDefinitions(prisma)
    await seedGpuMetricValues(prisma)
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

  let gpuFilesUnfiltered: string[]
  try {
    gpuFilesUnfiltered = await fs.readdir(gpuDataDir)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.error(`ERROR: GPU data directory does not exist: ${gpuDataDir}`)
      console.error(
        "Make sure the data submodule is checked out: git submodule update --init --recursive",
      )
      throw new Error("GPU data directory not found", { cause: error })
    }
    throw error
  }

  const gpuFiles = gpuFilesUnfiltered
    .filter((file) => {
      const isYaml = file.endsWith(".yaml")
      if (!isYaml) {
        console.warn(`Skipping file ${file} because it is not a YAML file`)
      }
      return isYaml
    })
    .map((file) => path.join(gpuDataDir, file))

  if (gpuFiles.length === 0) {
    console.error("ERROR: No GPU YAML files found in", gpuDataDir)
    console.error(
      "Make sure the data submodule is checked out: git submodule update --init --recursive",
    )
    throw new Error("No GPU data files found")
  }

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
      category: gpu.category,
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
      releaseDate: gpu.releaseDate,
      // gpu.lastModified is already a Date after Zod coercion
      lastModified: gpu.lastModified,
      msrpUSD: gpu.msrpUSD,
      // prisma doesn't like it when these nullable list args are undefined, so we have to catch that here:
      notes: isNil(gpu.notes) ? { equals: null } : { equals: gpu.notes },
      // JSON fields need special handling for comparison
      manufacturerIdentifiers: isNil(gpu.manufacturerIdentifiers)
        ? { equals: Prisma.DbNull }
        : { equals: gpu.manufacturerIdentifiers },
      thirdPartyProducts: isNil(gpu.thirdPartyProducts)
        ? { equals: Prisma.DbNull }
        : { equals: gpu.thirdPartyProducts },
    }
    const gpuCount = await prisma.gpu.count({
      where,
    })
    if (gpuCount > 0) {
      console.log("skipping gpu", gpu.name, "with same values.")
      continue
    }
    console.log("upserting gpu", gpu.name, "with different values...")
    // Transform nullable JSON fields for Prisma (null -> Prisma.DbNull)
    const gpuData = {
      ...gpu,
      manufacturerIdentifiers: isNil(gpu.manufacturerIdentifiers)
        ? Prisma.DbNull
        : gpu.manufacturerIdentifiers,
      thirdPartyProducts: isNil(gpu.thirdPartyProducts)
        ? Prisma.DbNull
        : gpu.thirdPartyProducts,
    }
    await prisma.gpu.upsert({
      where: { name: gpu.name },
      update: gpuData,
      create: gpuData,
    })
    console.log("upserting gpu", gpu.name, "complete.")
  }
}

// Resolution constants for benchmark label extraction
const RESOLUTION_4K_WIDTH = 3840
const RESOLUTION_4K_HEIGHT = 2160
const RESOLUTION_1440P_WIDTH = 2560
const RESOLUTION_1440P_HEIGHT = 1440
const RESOLUTION_1080P_WIDTH = 1920
const RESOLUTION_1080P_HEIGHT = 1080
const PARSE_RADIX = 10
// Regex capture group indices
const REGEX_CAPTURE_WIDTH = 1
const REGEX_CAPTURE_HEIGHT = 2

/**
 * Extract resolution label from benchmark configuration string
 * e.g., "pts/cs2-1.0.x - Resolution: 3840 x 2160" -> "(4K)"
 */
function extractResolutionLabel(configuration: string): string {
  const resolutionMatch = configuration.match(
    /resolution:\s*(\d+)\s*x\s*(\d+)/i,
  )
  if (!resolutionMatch) return ""

  const width = Number.parseInt(
    resolutionMatch[REGEX_CAPTURE_WIDTH],
    PARSE_RADIX,
  )
  const height = Number.parseInt(
    resolutionMatch[REGEX_CAPTURE_HEIGHT],
    PARSE_RADIX,
  )

  if (width === RESOLUTION_4K_WIDTH && height === RESOLUTION_4K_HEIGHT)
    return "(4K)"
  if (width === RESOLUTION_1440P_WIDTH && height === RESOLUTION_1440P_HEIGHT)
    return "(1440p)"
  if (width === RESOLUTION_1080P_WIDTH && height === RESOLUTION_1080P_HEIGHT)
    return "(1080p)"
  return `(${width}x${height})`
}

// NOTE: generateBenchmarkSlug() and getBenchmarkGpuField() have been removed.
// Benchmark slugs are now read directly from the metricSlug field in YAML files.
// Benchmark values are stored in GpuMetricValue, not in GPU table fields.
// See data/benchmark-data/benchmark-data.schema.json for field documentation.

/**
 * Seed MetricDefinition records from both specs.yaml and benchmark data files
 */
async function seedMetricDefinitions(prisma: PrismaClient): Promise<void> {
  console.info("Seeding metric definitions...")

  // Load spec definitions
  const specsFilePath = path.resolve(
    __dirname,
    "../../../data/metric-definitions/specs.yaml",
  )
  let specDefinitions: z.infer<typeof SpecMetricDefinitionSchema>[] = []

  try {
    const specsContent = await fs.readFile(specsFilePath, "utf8")
    const specsData = SpecsYamlSchema.parse(yaml.parse(specsContent))
    specDefinitions = specsData.metrics
    console.log(
      `Loaded ${specDefinitions.length} spec definitions from ${specsFilePath}`,
    )
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`Spec definitions file not found: ${specsFilePath}`)
    } else {
      throw error
    }
  }

  // Upsert spec definitions
  for (const spec of specDefinitions) {
    await prisma.metricDefinition.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        category: spec.category,
        metricType: spec.metricType,
        unit: spec.unit,
        unitShortest: spec.unitShortest,
        description: spec.description,
        descriptionDollarsPer: spec.descriptionDollarsPer,
        gpuField: spec.gpuField,
      },
      create: {
        slug: spec.slug,
        name: spec.name,
        category: spec.category,
        metricType: spec.metricType,
        unit: spec.unit,
        unitShortest: spec.unitShortest,
        description: spec.description,
        descriptionDollarsPer: spec.descriptionDollarsPer,
        gpuField: spec.gpuField,
      },
    })
    console.log(`Upserted spec metric definition: ${spec.slug}`)
  }

  // Load benchmark definitions from benchmark data files
  const benchmarkDataDir = path.resolve(
    __dirname,
    "../../../data/benchmark-data",
  )
  let benchmarkFiles: string[]

  try {
    const filesUnfiltered = await fs.readdir(benchmarkDataDir)
    benchmarkFiles = filesUnfiltered
      .filter(
        (file) =>
          file.endsWith(".yaml") &&
          file !== ".gitkeep" &&
          file !== "gpu-name-mapping.yaml",
      )
      .map((file) => path.join(benchmarkDataDir, file))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`Benchmark data directory not found: ${benchmarkDataDir}`)
      return
    }
    throw error
  }

  // Track unique slugs to avoid duplicates
  const seenSlugs = new Set<string>()

  for (const filePath of benchmarkFiles) {
    const contents = await fs.readFile(filePath, "utf8")
    let benchmarkData: BenchmarkData

    try {
      benchmarkData = BenchmarkDataSchema.parse(yaml.parse(contents))
    } catch (error) {
      console.warn(`Skipping invalid benchmark file ${filePath}:`, error)
      continue
    }

    // Use metricSlug from YAML file directly (no more algorithmic generation)
    const slug = benchmarkData.metricSlug

    // Skip duplicates
    if (seenSlugs.has(slug)) {
      continue
    }
    seenSlugs.add(slug)

    const resolutionLabel = extractResolutionLabel(benchmarkData.configuration)
    const name = resolutionLabel
      ? `${benchmarkData.benchmarkName} ${resolutionLabel}`
      : benchmarkData.benchmarkName

    // Benchmarks don't map to GPU table fields - values are stored in GpuMetricValue
    await prisma.metricDefinition.upsert({
      where: { slug },
      update: {
        name,
        category: benchmarkData.category,
        metricType: "benchmark",
        unit: benchmarkData.unit,
        unitShortest: benchmarkData.unitShortest,
        description: benchmarkData.description,
        descriptionDollarsPer: benchmarkData.descriptionDollarsPer,
        benchmarkId: benchmarkData.benchmarkId,
        benchmarkName: benchmarkData.benchmarkName,
        configuration: benchmarkData.configuration,
        configurationId: benchmarkData.configurationId,
        collectedSamples: benchmarkData.collectedSamples,
        gpuField: null,
      },
      create: {
        slug,
        name,
        category: benchmarkData.category,
        metricType: "benchmark",
        unit: benchmarkData.unit,
        unitShortest: benchmarkData.unitShortest,
        description: benchmarkData.description,
        descriptionDollarsPer: benchmarkData.descriptionDollarsPer,
        benchmarkId: benchmarkData.benchmarkId,
        benchmarkName: benchmarkData.benchmarkName,
        configuration: benchmarkData.configuration,
        configurationId: benchmarkData.configurationId,
        collectedSamples: benchmarkData.collectedSamples,
        gpuField: null,
      },
    })
    console.log(`Upserted benchmark metric definition: ${slug}`)
  }

  console.info("Metric definitions seeding complete")
}

/**
 * Seed GpuMetricValue records for both specs and benchmarks
 */
async function seedGpuMetricValues(prisma: PrismaClient): Promise<void> {
  console.info("Seeding GPU metric values...")

  // Get all metric definitions
  const metricDefinitions = await prisma.metricDefinition.findMany()
  const specDefinitions = metricDefinitions.filter(
    (m) => m.metricType === "spec",
  )
  const benchmarkDefinitions = metricDefinitions.filter(
    (m) => m.metricType === "benchmark",
  )

  // Get all GPUs
  const gpus = await prisma.gpu.findMany()
  console.log(
    `Found ${gpus.length} GPUs and ${metricDefinitions.length} metric definitions`,
  )

  // Seed spec values from GPU records
  let specValuesCount = 0
  for (const gpu of gpus) {
    for (const spec of specDefinitions) {
      if (!spec.gpuField) continue

      // Get the value from the GPU record using the gpuField mapping
      const value = (gpu as Record<string, unknown>)[spec.gpuField]
      if (value === null || value === undefined) continue

      await prisma.gpuMetricValue.upsert({
        where: {
          gpuName_metricSlug: {
            gpuName: gpu.name,
            metricSlug: spec.slug,
          },
        },
        update: { value: value as number },
        create: {
          gpuName: gpu.name,
          metricSlug: spec.slug,
          value: value as number,
        },
      })
      specValuesCount++
    }
  }
  console.log(`Upserted ${specValuesCount} spec metric values`)

  // Load GPU name mappings for benchmarks
  const benchmarkDataDir = path.resolve(
    __dirname,
    "../../../data/benchmark-data",
  )
  const mappingFilePath = path.join(benchmarkDataDir, "gpu-name-mapping.yaml")
  let gpuNameMappings: Record<string, string> = {}

  try {
    const mappingContent = await fs.readFile(mappingFilePath, "utf8")
    gpuNameMappings = yaml.parse(mappingContent) as Record<string, string>
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error
    }
  }

  // Get GPU names for quick lookup
  const gpuNames = new Set(gpus.map((g) => g.name))

  // Seed benchmark values from benchmark data files
  let benchmarkValuesCount = 0
  const unmappedGpus = new Set<string>()
  let benchmarkFiles: string[]

  try {
    const filesUnfiltered = await fs.readdir(benchmarkDataDir)
    benchmarkFiles = filesUnfiltered
      .filter(
        (file) =>
          file.endsWith(".yaml") &&
          file !== ".gitkeep" &&
          file !== "gpu-name-mapping.yaml",
      )
      .map((file) => path.join(benchmarkDataDir, file))
  } catch {
    console.warn("Could not read benchmark data directory")
    return
  }

  for (const filePath of benchmarkFiles) {
    const contents = await fs.readFile(filePath, "utf8")
    let benchmarkData: BenchmarkData

    try {
      benchmarkData = BenchmarkDataSchema.parse(yaml.parse(contents))
    } catch {
      continue
    }

    // Use metricSlug from YAML file directly (no more algorithmic generation)
    const slug = benchmarkData.metricSlug

    // Check if this metric definition exists
    const metricDef = benchmarkDefinitions.find((m) => m.slug === slug)
    if (!metricDef) {
      console.warn(`No metric definition found for slug: ${slug}`)
      continue
    }

    for (const result of benchmarkData.results) {
      // Map GPU name - check mapping file first, then fall back to gpuNameMapped
      const mappingValue = gpuNameMappings[result.gpuNameRaw]

      // IGNORE means explicitly skip this GPU without logging
      if (mappingValue === "IGNORE") {
        continue
      }

      const mappedName = mappingValue || result.gpuNameMapped

      if (!mappedName) {
        unmappedGpus.add(result.gpuNameRaw)
        continue
      }
      if (!gpuNames.has(mappedName)) {
        // Mapped name doesn't exist in GPU table
        console.warn(
          `UNMAPPED_GPU: "${result.gpuNameRaw}" mapped to "${mappedName}" but GPU not found in database`,
        )
        continue
      }

      await prisma.gpuMetricValue.upsert({
        where: {
          gpuName_metricSlug: {
            gpuName: mappedName,
            metricSlug: slug,
          },
        },
        update: { value: result.value },
        create: {
          gpuName: mappedName,
          metricSlug: slug,
          value: result.value,
        },
      })
      benchmarkValuesCount++
    }
  }
  console.log(`Upserted ${benchmarkValuesCount} benchmark metric values`)

  console.info("GPU metric values seeding complete")

  if (unmappedGpus.size > 0) {
    console.log(`\n⚠️  UNMAPPED BENCHMARK GPUS (${unmappedGpus.size} unique):`)
    for (const gpuName of [...unmappedGpus].sort()) {
      console.log(`  - ${gpuName}`)
    }
    console.log(`Add mappings to data/benchmark-data/gpu-name-mapping.yaml\n`)
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
