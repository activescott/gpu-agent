import path from "path"
import yaml from "yaml"
import { appRoot } from "@/pkgs/server/path"
import { readFile, readdir } from "fs/promises"
import { createDiag } from "@activescott/diag"
import { z } from "zod"

const log = createDiag("shopping-agent:MetricRepository")

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

export type BenchmarkData = z.infer<typeof BenchmarkDataSchema>

// Unified metric definition type
export interface MetricDefinition {
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
}

// GPU metric value
export interface GpuMetricValue {
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

  const width = Number.parseInt(resolutionMatch[1], 10)
  const height = Number.parseInt(resolutionMatch[2], 10)

  if (width === 3840 && height === 2160) return "(4K)"
  if (width === 2560 && height === 1440) return "(1440p)"
  if (width === 1920 && height === 1080) return "(1080p)"
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
    const width = resolutionMatch[1]
    const height = resolutionMatch[2]
    return `${baseName}-${width}x${height}`
  }

  return baseName
}

/**
 * Load spec metric definitions from YAML
 */
export async function loadSpecDefinitions(): Promise<MetricDefinition[]> {
  const filePath = path.join(getMetricDefinitionsDir(), "specs.yaml")
  log.debug("Loading spec definitions from:", filePath)

  try {
    const content = await readFile(filePath, "utf8")
    const data = SpecsYamlSchema.parse(yaml.parse(content))

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
    }))
  } catch (error) {
    log.error("Error loading spec definitions:", error)
    return []
  }
}

/**
 * Load a single benchmark data file
 */
export async function loadBenchmarkData(
  fileName: string,
): Promise<BenchmarkData | null> {
  const filePath = path.join(getBenchmarkDataDir(), fileName)

  try {
    const content = await readFile(filePath, "utf8")
    return BenchmarkDataSchema.parse(yaml.parse(content))
  } catch (error) {
    log.error(`Error loading benchmark file ${fileName}:`, error)
    return null
  }
}

/**
 * Load all benchmark data files
 */
export async function loadAllBenchmarkData(): Promise<BenchmarkData[]> {
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
    log.error("Error loading benchmark data:", error)
    return []
  }
}

/**
 * Load benchmark metric definitions from YAML files
 */
export async function loadBenchmarkDefinitions(): Promise<MetricDefinition[]> {
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
export async function getMetricDefinition(
  slug: string,
): Promise<MetricDefinition | null> {
  const definitions = await listMetricDefinitions()
  return definitions.find((d) => d.slug === slug) || null
}

/**
 * List metrics by category
 */
export async function listMetricsByCategory(
  category: "ai" | "gaming",
): Promise<MetricDefinition[]> {
  const definitions = await listMetricDefinitions()
  return definitions.filter((d) => d.category === category)
}

/**
 * List only benchmark definitions
 */
export async function listBenchmarkMetricDefinitions(): Promise<
  MetricDefinition[]
> {
  return loadBenchmarkDefinitions()
}

/**
 * List only spec definitions
 */
export async function listSpecMetricDefinitions(): Promise<MetricDefinition[]> {
  return loadSpecDefinitions()
}

/**
 * List all metric slugs
 */
export async function listMetricSlugs(): Promise<string[]> {
  const definitions = await listMetricDefinitions()
  return definitions.map((d) => d.slug)
}

/**
 * List benchmark slugs only
 */
export async function listBenchmarkSlugs(): Promise<string[]> {
  const definitions = await loadBenchmarkDefinitions()
  return definitions.map((d) => d.slug)
}

/**
 * List spec slugs only
 */
export async function listSpecSlugs(): Promise<string[]> {
  const definitions = await loadSpecDefinitions()
  return definitions.map((d) => d.slug)
}

/**
 * Load GPU name mapping from YAML
 */
export async function loadGpuNameMapping(): Promise<Record<string, string>> {
  const filePath = path.join(getBenchmarkDataDir(), "gpu-name-mapping.yaml")

  try {
    const content = await readFile(filePath, "utf8")
    const data = yaml.parse(content)
    return data.mappings || {}
  } catch (error) {
    log.warn("Could not load GPU name mapping:", error)
    return {}
  }
}

/**
 * Extract benchmark values for all GPUs for a specific benchmark
 */
export async function getBenchmarkValuesForSlug(
  slug: string,
): Promise<GpuMetricValue[]> {
  const definition = await getMetricDefinition(slug)
  if (!definition || definition.metricType !== "benchmark") {
    return []
  }

  const benchmarks = await loadAllBenchmarkData()
  const mapping = await loadGpuNameMapping()

  // Find the benchmark data that matches this definition
  const benchmark = benchmarks.find((b) => {
    const benchmarkSlug = generateBenchmarkSlug(b.benchmarkId, b.configuration)
    return benchmarkSlug === slug
  })

  if (!benchmark) {
    return []
  }

  return benchmark.results.map((r) => ({
    gpuName: r.gpuNameMapped || mapping[r.gpuNameRaw] || r.gpuNameRaw,
    metricSlug: slug,
    value: r.value,
  }))
}
