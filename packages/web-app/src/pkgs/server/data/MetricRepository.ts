import path from "path"
import yaml from "yaml"
import { appRoot } from "@/pkgs/server/path"
import { readFile, readdir } from "fs/promises"
import { createLogger } from "@/lib/logger"
import { z } from "zod"

const log = createLogger("MetricRepository")

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
  updatedAt: z.string(),
  metrics: z.array(SpecMetricDefinitionSchema),
})

// Schema for benchmark data from YAML files
const BenchmarkDataSchema = z.object({
  benchmarkId: z.string(),
  benchmarkName: z.string(),
  configuration: z.string(),
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

// Unified metric definition type
interface MetricDefinition {
  slug: string
  name: string
  category: "ai" | "gaming"
  metricType: "spec" | "benchmark"
  unit: string
  unitShortest: string
  description: string
  descriptionDollarsPer: string
  // For specs: maps to field name in gpu-specs YAML
  gpuField?: string
  // For benchmarks: source info
  benchmarkId?: string
  benchmarkName?: string
  configuration?: string
  configurationId?: string
  // For benchmarks: number of public benchmark results this metric is based on
  collectedSamples?: number
  // When the metric definition was last updated (from source YAML)
  updatedAt: Date
}

// GPU metric value
interface _GpuMetricValue {
  gpuName: string
  metricSlug: string
  value: number
}

function getDataDir(): string {
  return path.join(appRoot(), "..", "..", "..", "data")
}

function getMetricDefinitionsDir(): string {
  return path.join(getDataDir(), "metric-definitions")
}

function getBenchmarkDataDir(): string {
  return path.join(getDataDir(), "benchmark-data")
}

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

/**
 * Generate a slug from benchmark data
 * e.g., "cs2" + "3840 x 2160" -> "counter-strike-2-fps-3840x2160"
 */
function generateBenchmarkSlug(
  benchmarkId: string,
  configuration: string,
): string {
  const resolutionMatch = configuration.match(
    /resolution:\s*(\d+)\s*x\s*(\d+)/i,
  )

  // Map benchmark IDs to readable names
  const benchmarkNameMap: Record<string, string> = {
    cs2: "counter-strike-2-fps",
    "3dmark": "3dmark-wildlife-extreme-fps",
    quake2rtx: "quake2rtx-fps",
  }

  const baseName = benchmarkNameMap[benchmarkId] || benchmarkId

  if (resolutionMatch) {
    const width = resolutionMatch[REGEX_CAPTURE_WIDTH]
    const height = resolutionMatch[REGEX_CAPTURE_HEIGHT]
    return `${baseName}-${width}x${height}`
  }

  return baseName
}

/**
 * Load spec metric definitions from YAML
 */
async function loadSpecDefinitions(): Promise<MetricDefinition[]> {
  const filePath = path.join(getMetricDefinitionsDir(), "specs.yaml")
  log.debug({ filePath }, "Loading spec definitions")

  try {
    const content = await readFile(filePath, "utf8")
    const data = SpecsYamlSchema.parse(yaml.parse(content))
    const specsUpdatedAt = new Date(data.updatedAt)

    return data.metrics.map((m) => ({
      slug: m.slug,
      name: m.name,
      category: m.category,
      metricType: m.metricType,
      unit: m.unit,
      unitShortest: m.unitShortest,
      description: m.description,
      descriptionDollarsPer: m.descriptionDollarsPer,
      gpuField: m.gpuField,
      updatedAt: specsUpdatedAt,
    }))
  } catch (error) {
    log.error({ err: error }, "Error loading spec definitions")
    return []
  }
}

/**
 * Load a single benchmark data file
 */
async function loadBenchmarkData(
  fileName: string,
): Promise<BenchmarkData | null> {
  const filePath = path.join(getBenchmarkDataDir(), fileName)

  try {
    const content = await readFile(filePath, "utf8")
    return BenchmarkDataSchema.parse(yaml.parse(content))
  } catch (error) {
    log.error({ err: error, fileName }, "Error loading benchmark file")
    return null
  }
}

/**
 * Load all benchmark data files
 */
async function loadAllBenchmarkData(): Promise<BenchmarkData[]> {
  const dataDir = getBenchmarkDataDir()

  try {
    const files = await readdir(dataDir)
    const yamlFiles = files.filter(
      (f) => f.endsWith(".yaml") && f !== "gpu-name-mapping.yaml",
    )

    const results = await Promise.all(
      yamlFiles.map((f) => loadBenchmarkData(f)),
    )

    return results.filter((r): r is BenchmarkData => r !== null)
  } catch (error) {
    log.error({ err: error }, "Error loading benchmark data")
    return []
  }
}

/**
 * Load benchmark metric definitions from YAML files
 */
async function loadBenchmarkDefinitions(): Promise<MetricDefinition[]> {
  const benchmarks = await loadAllBenchmarkData()

  // Track unique slugs to avoid duplicates (e.g., 3dmark at different resolutions)
  const seenSlugs = new Set<string>()
  const definitions: MetricDefinition[] = []

  for (const benchmark of benchmarks) {
    const slug = generateBenchmarkSlug(
      benchmark.benchmarkId,
      benchmark.configuration,
    )

    // Skip if we've already seen this slug
    if (seenSlugs.has(slug)) {
      continue
    }
    seenSlugs.add(slug)

    const resolutionLabel = extractResolutionLabel(benchmark.configuration)
    const name = resolutionLabel
      ? `${benchmark.benchmarkName} ${resolutionLabel}`
      : benchmark.benchmarkName

    definitions.push({
      slug,
      name,
      category: benchmark.category,
      metricType: "benchmark",
      unit: benchmark.unit,
      unitShortest: benchmark.unitShortest,
      description: benchmark.description,
      descriptionDollarsPer: benchmark.descriptionDollarsPer,
      benchmarkId: benchmark.benchmarkId,
      benchmarkName: benchmark.benchmarkName,
      configuration: benchmark.configuration,
      configurationId: benchmark.configurationId,
      collectedSamples: benchmark.collectedSamples,
      updatedAt: new Date(benchmark.updatedAt),
    })
  }

  return definitions
}

/**
 * Load all metric definitions (both specs and benchmarks)
 */
export async function listMetricDefinitions(): Promise<MetricDefinition[]> {
  const [specs, benchmarks] = await Promise.all([
    loadSpecDefinitions(),
    loadBenchmarkDefinitions(),
  ])

  return [...specs, ...benchmarks]
}

/**
 * Get a specific metric definition by slug
 */
async function _getMetricDefinition(
  slug: string,
): Promise<MetricDefinition | null> {
  const definitions = await listMetricDefinitions()
  return definitions.find((d) => d.slug === slug) || null
}

/**
 * List metrics by category
 */
async function _listMetricsByCategory(
  category: "ai" | "gaming",
): Promise<MetricDefinition[]> {
  const definitions = await listMetricDefinitions()
  return definitions.filter((d) => d.category === category)
}

/**
 * List only benchmark definitions
 */
async function _listBenchmarkMetricDefinitions(): Promise<MetricDefinition[]> {
  return loadBenchmarkDefinitions()
}

/**
 * List only spec definitions
 */
async function _listSpecMetricDefinitions(): Promise<MetricDefinition[]> {
  return loadSpecDefinitions()
}

/**
 * List all metric slugs
 */
async function _listMetricSlugs(): Promise<string[]> {
  const definitions = await listMetricDefinitions()
  return definitions.map((d) => d.slug)
}

/**
 * List benchmark slugs only
 */
async function _listBenchmarkSlugs(): Promise<string[]> {
  const definitions = await loadBenchmarkDefinitions()
  return definitions.map((d) => d.slug)
}

/**
 * List spec slugs only
 */
async function _listSpecSlugs(): Promise<string[]> {
  const definitions = await loadSpecDefinitions()
  return definitions.map((d) => d.slug)
}
