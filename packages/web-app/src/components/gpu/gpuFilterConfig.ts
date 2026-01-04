import type {
  FilterConfig,
  CategoricalFilterConfig,
  NumericFilterConfig,
} from "@/components/filter-items"
import type { PricedGpu } from "@/pkgs/server/db/GpuRepository"

// Constants for filter ranges
const PRICE_MIN = 0
const PRICE_MAX = 5000
const PRICE_STEP = 50

const MEMORY_MIN = 4
const MEMORY_MAX = 80
const MEMORY_STEP = 4

const BANDWIDTH_MIN = 200
const BANDWIDTH_MAX = 2100
const BANDWIDTH_STEP = 100

const TFLOPS_STEP = 10
const FALLBACK_MAX = 100
const FALLBACK_STEP = 10

const TDP_MIN = 100
const TDP_MAX = 600
const TDP_STEP = 25

// FPS range for gaming benchmarks
const FPS_MIN = 0
const FPS_MAX = 500
const FPS_STEP = 10

/** Gaming benchmark definition for filter config */
interface GamingBenchmarkDef {
  slug: string
  name: string
  unit: string
}

/**
 * Options for building GPU filter configs
 */
interface GpuFilterConfigOptions {
  /** Current page's metric info (to add as a filterable field) */
  metricInfo?: {
    name: string
    unit: string
    slug: string
  }
  /** Gaming benchmark definitions for cross-category filtering */
  gamingBenchmarks?: GamingBenchmarkDef[]
}

/**
 * Build filter configurations dynamically from GPU data
 * Extracts unique values for categorical filters
 */
export function buildGpuFilterConfigs(
  gpus: PricedGpu[],
  options: GpuFilterConfigOptions = {},
): FilterConfig[] {
  // Extract unique series values
  const seriesValues = extractUniqueValues(gpus, (g) => g.gpu.series)

  const configs: FilterConfig[] = [
    // Budget/Price filter (numeric) - default to "At most"
    {
      type: "numeric",
      name: "price",
      displayName: "Budget",
      min: PRICE_MIN,
      max: PRICE_MAX,
      step: PRICE_STEP,
      unit: "$",
      defaultOperator: "lte",
    } satisfies NumericFilterConfig,

    // Memory filter (numeric) - default to "At least"
    {
      type: "numeric",
      name: "memoryCapacityGB",
      displayName: "Memory",
      min: MEMORY_MIN,
      max: MEMORY_MAX,
      step: MEMORY_STEP,
      unit: "GB",
      defaultOperator: "gte",
    } satisfies NumericFilterConfig,

    // Memory Bandwidth filter (numeric) - default to "At least"
    {
      type: "numeric",
      name: "memoryBandwidthGBs",
      displayName: "Memory Bandwidth",
      min: BANDWIDTH_MIN,
      max: BANDWIDTH_MAX,
      step: BANDWIDTH_STEP,
      unit: "GB/s",
      defaultOperator: "gte",
    } satisfies NumericFilterConfig,

    // TDP filter (numeric) - default to "At most"
    {
      type: "numeric",
      name: "maxTDPWatts",
      displayName: "Max TDP",
      min: TDP_MIN,
      max: TDP_MAX,
      step: TDP_STEP,
      unit: "W",
      defaultOperator: "lte",
    } satisfies NumericFilterConfig,
  ]

  // Add current page's metric as a filter if provided
  if (options.metricInfo) {
    const { name, unit } = options.metricInfo
    const isFps = unit === "FPS" || unit === "fps"
    const isTflops = unit.includes("FLOPS") || unit.includes("TOPS")

    // Calculate dynamic range from GPU data
    const metricValues = gpus
      .map((g) => g.metricValue)
      .filter((v): v is number => v !== null && v !== undefined)

    const metricMin =
      metricValues.length > 0 ? Math.floor(Math.min(...metricValues)) : 0
    const metricMax =
      metricValues.length > 0
        ? Math.ceil(Math.max(...metricValues))
        : FALLBACK_MAX

    // Determine appropriate step
    let metricStep = 1
    if (isFps) {
      metricStep = FPS_STEP
    } else if (isTflops) {
      metricStep = TFLOPS_STEP
    } else if (metricMax > FALLBACK_MAX) {
      metricStep = FALLBACK_STEP
    }

    configs.push({
      type: "numeric",
      name: "metricValue",
      displayName: `Min ${name}`,
      min: isFps ? FPS_MIN : metricMin,
      max: isFps ? FPS_MAX : metricMax,
      step: metricStep,
      unit: unit,
      defaultOperator: "gte",
    } satisfies NumericFilterConfig)
  }

  // Add gaming benchmark filters (for cross-category filtering)
  // This allows users to filter by gaming FPS while viewing AI rankings, or vice versa
  if (options.gamingBenchmarks && options.gamingBenchmarks.length > 0) {
    for (const benchmark of options.gamingBenchmarks) {
      // Skip if this is already the current metric being displayed
      if (options.metricInfo && benchmark.slug === options.metricInfo.slug) {
        continue
      }

      configs.push({
        type: "numeric",
        name: `benchmark:${benchmark.slug}`,
        displayName: `Min ${benchmark.name}`,
        min: FPS_MIN,
        max: FPS_MAX,
        step: FPS_STEP,
        unit: benchmark.unit,
        defaultOperator: "gte",
      } satisfies NumericFilterConfig)
    }
  }

  // Add series filter if there are multiple series
  if (seriesValues.length > 1) {
    configs.push({
      type: "categorical",
      name: "series",
      displayName: "Series",
      options: seriesValues.map((v) => ({ value: v, label: v })),
    } satisfies CategoricalFilterConfig)
  }

  return configs
}

/** Extended PricedGpu with benchmark values for filtering */
interface PricedGpuWithBenchmarks extends PricedGpu {
  benchmarkValues?: Record<string, number>
}

/**
 * Get field value from a PricedGpu for filtering
 */
export function getGpuFieldValue(
  pricedGpu: PricedGpuWithBenchmarks,
  fieldName: string,
): unknown {
  // Handle benchmark fields (format: "benchmark:slug")
  if (fieldName.startsWith("benchmark:")) {
    const benchmarkSlug = fieldName.slice("benchmark:".length)
    return pricedGpu.benchmarkValues?.[benchmarkSlug]
  }

  switch (fieldName) {
    // Price from GpuPriceStats
    case "price": {
      return pricedGpu.price.minPrice
    }

    // Direct GPU fields
    case "memoryCapacityGB": {
      return pricedGpu.gpu.memoryCapacityGB
    }
    case "memoryBandwidthGBs": {
      return pricedGpu.gpu.memoryBandwidthGBs
    }
    case "fp32TFLOPS": {
      return pricedGpu.gpu.fp32TFLOPS
    }
    case "fp16TFLOPS": {
      return pricedGpu.gpu.fp16TFLOPS
    }
    case "tensorCoreCount": {
      return pricedGpu.gpu.tensorCoreCount
    }
    case "int8TOPS": {
      return pricedGpu.gpu.int8TOPS
    }
    case "maxTDPWatts": {
      return pricedGpu.gpu.maxTDPWatts
    }
    case "series": {
      return pricedGpu.gpu.series
    }

    // Percentile if available
    case "percentile": {
      return pricedGpu.percentile
    }

    // Metric value if available
    case "metricValue": {
      return pricedGpu.metricValue
    }

    default: {
      // Try to access the field from gpu object
      const gpuRecord = pricedGpu.gpu as Record<string, unknown>
      return gpuRecord[fieldName]
    }
  }
}

/**
 * Extract unique non-null string values from GPUs
 */
function extractUniqueValues(
  gpus: PricedGpu[],
  accessor: (gpu: PricedGpu) => string | null | undefined,
): string[] {
  const values = new Set<string>()
  for (const gpu of gpus) {
    const value = accessor(gpu)
    if (value) {
      values.add(value)
    }
  }
  return [...values].sort()
}

/**
 * Options for building listing filter configs
 */
interface ListingFilterConfigOptions {
  /** Gaming benchmark definitions for cross-category filtering */
  gamingBenchmarks?: GamingBenchmarkDef[]
  /** Current page's metric slug (to skip adding it as a separate filter) */
  currentMetricSlug?: string
  /** Whether to include GPU spec filters (Memory, etc.). Default: true */
  includeSpecFilters?: boolean
  /** Maximum price for budget filter (derived from listings). Default: PRICE_MAX */
  maxPrice?: number
  /** Unique country codes from listings for country filter */
  countries?: string[]
}

/**
 * Filter configs specifically for listings (price-compare page and shop page)
 * Use includeSpecFilters: false for shop page (single GPU, no need for spec filters)
 */
export function buildListingFilterConfigs(
  options: ListingFilterConfigOptions = {},
): FilterConfig[] {
  const {
    includeSpecFilters = true,
    gamingBenchmarks,
    currentMetricSlug,
    maxPrice = PRICE_MAX,
    countries = [],
  } = options

  // Round max price up to nearest step for cleaner slider values
  const roundedMaxPrice = Math.ceil(maxPrice / PRICE_STEP) * PRICE_STEP

  const configs: FilterConfig[] = [
    // Budget/Price filter (numeric) - default to "At most"
    {
      type: "numeric",
      name: "price",
      displayName: "Budget",
      min: PRICE_MIN,
      max: roundedMaxPrice,
      step: PRICE_STEP,
      unit: "$",
      defaultOperator: "lte",
    } satisfies NumericFilterConfig,

    // Condition filter (categorical)
    {
      type: "categorical",
      name: "condition",
      displayName: "Condition",
      options: [
        { value: "New", label: "New" },
        { value: "Used", label: "Used" },
        { value: "Refurbished", label: "Refurbished" },
      ],
    } satisfies CategoricalFilterConfig,
  ]

  // Add country filter if countries are available
  if (countries.length > 0) {
    configs.push({
      type: "categorical",
      name: "itemLocationCountry",
      displayName: "Country",
      options: countries.map((code) => ({
        value: code,
        label: code,
      })),
    } satisfies CategoricalFilterConfig)
  }

  // Add spec filters only when includeSpecFilters is true (default)
  // These are irrelevant for shop pages since all listings are for the same GPU
  if (includeSpecFilters) {
    // Memory filter (numeric) - default to "At least"
    // Insert after Budget, before Condition
    configs.splice(1, 0, {
      type: "numeric",
      name: "memoryCapacityGB",
      displayName: "Memory",
      min: MEMORY_MIN,
      max: MEMORY_MAX,
      step: MEMORY_STEP,
      unit: "GB",
      defaultOperator: "gte",
    } satisfies NumericFilterConfig)

    // Add gaming benchmark filters (for cross-category filtering)
    if (gamingBenchmarks && gamingBenchmarks.length > 0) {
      for (const benchmark of gamingBenchmarks) {
        // Skip if this is the current metric being displayed
        if (currentMetricSlug === benchmark.slug) {
          continue
        }

        configs.push({
          type: "numeric",
          name: `benchmark:${benchmark.slug}`,
          displayName: `Min ${benchmark.name}`,
          min: FPS_MIN,
          max: FPS_MAX,
          step: FPS_STEP,
          unit: benchmark.unit,
          defaultOperator: "gte",
        } satisfies NumericFilterConfig)
      }
    }
  }

  return configs
}

/** Listing with optional benchmark values for filtering */
interface ListingWithBenchmarks {
  item: {
    priceValue: string
    condition: string | null
    itemLocationCountry?: string | null
    gpu: Record<string, unknown>
  }
  benchmarkValues?: Record<string, number>
}

/**
 * Get field value from a listing item for filtering
 * Works with the ListingItemWithMetric type from price-compare page
 */
export function getListingFieldValue(
  listing: ListingWithBenchmarks,
  fieldName: string,
): unknown {
  // Handle benchmark fields (format: "benchmark:slug")
  if (fieldName.startsWith("benchmark:")) {
    const benchmarkSlug = fieldName.slice("benchmark:".length)
    return listing.benchmarkValues?.[benchmarkSlug]
  }

  switch (fieldName) {
    case "price": {
      return Number.parseFloat(listing.item.priceValue)
    }
    case "condition": {
      return listing.item.condition
    }
    case "itemLocationCountry": {
      return listing.item.itemLocationCountry
    }
    case "memoryCapacityGB": {
      return listing.item.gpu.memoryCapacityGB
    }
    case "memoryBandwidthGBs": {
      return listing.item.gpu.memoryBandwidthGBs
    }
    case "fp32TFLOPS": {
      return listing.item.gpu.fp32TFLOPS
    }
    default: {
      // Try to access the field from listing.item or listing.item.gpu
      const itemRecord = listing.item as Record<string, unknown>
      if (fieldName in itemRecord) {
        return itemRecord[fieldName]
      }
      return listing.item.gpu[fieldName]
    }
  }
}

/** Shop listing item structure (from /gpu/shop/[gpuSlug] page) */
interface ShopListingItem {
  item: {
    priceValue: string
    condition: string | null
    itemLocationCountry?: string | null
  }
  specs: Record<string, unknown>
}

/**
 * Get field value from a shop listing for filtering
 * Works with { item: Listing, specs: Gpu } structure used on shop pages
 */
export function getShopListingFieldValue(
  listing: ShopListingItem,
  fieldName: string,
): unknown {
  switch (fieldName) {
    case "price": {
      return Number.parseFloat(listing.item.priceValue)
    }
    case "condition": {
      return listing.item.condition
    }
    case "itemLocationCountry": {
      return listing.item.itemLocationCountry
    }
    default: {
      // Fallback to specs if needed in future
      return listing.specs[fieldName]
    }
  }
}
