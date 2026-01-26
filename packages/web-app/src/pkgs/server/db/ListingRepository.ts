/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  CRITICAL DATA RETENTION POLICY ⚠️
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This repository manages GPU listing data with soft-delete archival.
 *
 * KEY PRINCIPLES:
 * 1. Listings are NEVER hard-deleted from the database
 * 2. Old listings are marked as archived (archived=true) but preserved forever
 * 3. Active queries filter by archived=false to show current listings
 * 4. Historical queries include ALL listings (active + archived) for price trends
 *
 * WHY THIS MATTERS:
 * - Historical price data is invaluable for tracking market trends
 * - Users rely on historical charts to make purchasing decisions
 * - Deleting archived data would break all historical analysis features
 * - Storage cost is minimal compared to the value of historical data
 *
 * NEVER DELETE ARCHIVED LISTINGS!
 * If you need to clean up data, create a new migration with extreme caution
 * and document the business justification thoroughly.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  Listing,
  ListingWithMetric,
  Gpu,
  parseGpu,
} from "@/pkgs/isomorphic/model"
import { createLogger } from "@/lib/logger"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { omit } from "lodash"
import { GpuMetricKey } from "@/pkgs/isomorphic/model/metrics"
import { Prisma } from "@prisma/client"
import { CACHED_LISTINGS_DURATION_MS } from "../cacheConfig"
import { EPOCH } from "@/pkgs/isomorphic/duration"
import { createHash } from "crypto"

const log = createLogger("ListingRepository")

/* We keep cachedAt in the DB and it is used in the ListingRepository and in Listings */
export type CachedListing = Listing & { cachedAt: Date }

// Type for Prisma listing results that include gpu
type PrismaListingWithGpu = Prisma.ListingGetPayload<{ include: { gpu: true } }>

/**
 * Parse a Prisma listing result that includes gpu, validating JSONB fields.
 */
function parsePrismaListingWithGpu(
  listing: PrismaListingWithGpu,
): CachedListing {
  return {
    ...listing,
    gpu: parseGpu(listing.gpu),
  } satisfies CachedListing
}

/**
 * Creates a hash of key fields to detect changes in listings
 */
function hashKeyFields(listing: {
  itemId: string
  priceValue: string
  title: string
  condition?: string | null
}): string {
  return createHash("md5")
    .update(
      `${listing.itemId}-${listing.priceValue}-${listing.title}-${listing.condition || ""}`,
    )
    .digest("hex")
}

/**
 * Finds the current active listing by itemId
 */
async function findActiveByItemId(
  itemId: string,
  prisma: PrismaClientWithinTransaction,
): Promise<{
  id: string
  version: number
  itemId: string
  priceValue: string
  title: string
  condition?: string | null
} | null> {
  return await prisma.listing.findFirst({
    where: {
      itemId,
      archived: false,
      exclude: false,
    },
    select: {
      id: true,
      version: true,
      itemId: true,
      priceValue: true,
      title: true,
      condition: true,
    },
  })
}

interface DataChangeCheckResult {
  /**
   * True if the listing data has changed and a new version should be created.
   * False if the listing (1) does not exist OR (2) exists but has not changed.
   */
  didChange: boolean
  /**
   * The current active listing, if it exists.
   */
  existingListing?: { id: string; version: number }
}

/**
 * Checks if an incoming listing should create a new version
 */
async function didListingDataChange(
  itemId: string,
  incomingListing: {
    priceValue: string
    title: string
    condition?: string | null
  },
  prisma: PrismaClientWithinTransaction,
): Promise<DataChangeCheckResult> {
  const current = await findActiveByItemId(itemId, prisma)
  if (!current) {
    return { didChange: false }
  }

  const currentHash = hashKeyFields(current)
  const incomingHash = hashKeyFields({ itemId, ...incomingListing })

  return {
    didChange: currentHash !== incomingHash,
    existingListing: { id: current.id, version: current.version },
  }
}

export async function listActiveListingsForGpus(
  gpuNames: string[],
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<CachedListing[]> {
  const listings = await prisma.listing.findMany({
    where: {
      gpuName: { in: gpuNames },
      archived: false,
      exclude: false,
    },
    include: {
      gpu: true,
    },
  })
  return listings.map((listing) => parsePrismaListingWithGpu(listing))
}

export type GpuWithListings = {
  listings: CachedListing[]
  gpuName: string
}

/**
 * Returns the set of cached listings for all GPUs. Some listings may be empty.
 * NOTE: This is a useful operation since it allows pulling both a complete list of all GPUs, AND their associated listings (which may be empty).
 * If the listings are empty, the caller can then decide to fetch new listings to cache for the GPU.
 */
export async function listActiveListingsGroupedByGpu(
  includeTestGpus: boolean = false,
  prisma: PrismaClientWithinTransaction,
): Promise<GpuWithListings[]> {
  const where = {} as Prisma.gpuWhereInput
  if (!includeTestGpus) {
    where.name = { not: "test-gpu" }
  }

  const gpus = await prisma.gpu.findMany({
    where,
    include: {
      Listing: {
        where: {
          archived: false,
          exclude: false,
        },
      },
    },
  })

  const result = gpus.map((gpu) => {
    const parsedGpu = parseGpu(gpu)
    return {
      // NOTE: The returned listing doesn't have the gpu field hydrated, so we add it here
      listings: gpu.Listing.map((listing) => ({
        ...listing,
        gpu: parsedGpu,
      })) as CachedListing[],
      gpuName: gpu.name,
    }
  })
  return result
}

// Legacy alias for backward compatibility
export const listCachedListingsGroupedByGpu = listActiveListingsGroupedByGpu

export async function listActiveListings(
  includeTestGpus: boolean = false,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<CachedListing[]> {
  const where: Prisma.ListingWhereInput = {
    archived: false,
    exclude: false,
    ...(includeTestGpus ? {} : { gpuName: { not: "test-gpu" } }),
  }
  const listings = await prisma.listing.findMany({
    where: where,
    include: {
      gpu: true,
    },
  })
  return listings.map((listing) => parsePrismaListingWithGpu(listing))
}

// Legacy alias for backward compatibility
export const listCachedListings = listActiveListings

/**
 * Returns the latest creation date across all listings.
 */
export async function getLatestListingDate(
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Date> {
  const result = await prisma.listing.findFirst({
    where: {
      archived: false,
      exclude: false,
    },
    orderBy: { itemCreationDate: "desc" },
    select: { itemCreationDate: true },
  })
  if (result?.itemCreationDate === undefined) {
    log.error(
      "No itemCreationDate for active listings found in the database. Returning EPOCH.",
    )
  }
  return result?.itemCreationDate ?? EPOCH
}

/**
 * Adds or updates the specified listings in the database with versioning support.
 * Archives existing listings that have changed and creates new versions.
 * You must supply a prisma client that is already wrapped in a transaction, as this involves many queries.
 */
export async function addOrRefreshListingsForGpu(
  freshListingsFromEbay: Listing[],
  gpuName: string,
  prisma: PrismaClientWithinTransaction,
): Promise<void> {
  log.info(`Processing listings for ${gpuName}...`)
  if (freshListingsFromEbay.length === 0) {
    log.warn(
      `No listings from ebay to add or refresh for gpu ${gpuName}. Aborting attempt to cache new listings.`,
    )
    return
  }

  const cachedAt = new Date()
  const archivedAt = cachedAt
  let createdCount = 0
  let archivedCount = 0
  let noChangeCount = 0

  for (const freshListing of freshListingsFromEbay) {
    const listingData = {
      // NOTE: prisma doesn't like the hydrated gpu field in the listing, so we omit it
      ...omit(freshListing, "gpu"),
      gpuName,
      cachedAt,
    }

    // Check if we need to create a new version
    const changeCheck = await didListingDataChange(
      freshListing.itemId,
      {
        priceValue: freshListing.priceValue,
        title: freshListing.title,
        condition: freshListing.condition,
      },
      prisma,
    )

    if (changeCheck.didChange && changeCheck.existingListing) {
      // Archive the current version so we can report on historical data
      log.info(
        `Listing ${freshListing.itemId} has changed. Archiving current version and creating a new version.`,
      )
      await prisma.listing.update({
        where: { id: changeCheck.existingListing.id },
        data: {
          archived: true,
          archivedAt,
        },
      })
      archivedCount++

      // Create new version
      await prisma.listing.create({
        data: {
          ...listingData,
          version: changeCheck.existingListing.version + 1,
        },
      })
      createdCount++
    } else if (changeCheck.existingListing) {
      // Listing exists and hasn't changed. Update the cachedAt timestamp so it doesn't become stale:
      await prisma.listing.update({
        where: { id: changeCheck.existingListing.id },
        data: {
          cachedAt,
        },
      })
      noChangeCount++
    } else {
      // No existing listing, create new one
      log.debug(`Creating new listing for ${freshListing.itemId}`)
      await prisma.listing.create({
        data: {
          ...listingData,
          version: 1,
        },
      })
      createdCount++
    }
  }

  log.info(
    `Processing listings for ${gpuName} complete. Created: ${createdCount}, Archived: ${archivedCount}, Unchanged: ${noChangeCount}`,
  )
}

/**
 * CRITICAL: Archives stale listings but NEVER deletes them from the database.
 *
 * This function marks listings older than CACHED_LISTINGS_DURATION_MS as archived
 * by setting archived=true and archivedAt timestamp. Archived listings are preserved
 * for historical price tracking and analysis.
 *
 * ⚠️ WARNING: NEVER delete archived listings! Historical queries (getHistoricalPriceData,
 * getAvailabilityTrends, etc.) rely on archived data to show price trends over time.
 * Deleting archived listings would destroy valuable historical data.
 *
 * The archive operation only affects active listing queries (which filter archived=false).
 * Historical queries intentionally include both active AND archived listings to provide
 * complete price history.
 */
export async function archiveStaleListingsForGpu(
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<void> {
  log.info(`Archiving stale listings for ${gpuName}`)
  const archivedAt = new Date()
  const resp = await prisma.listing.updateMany({
    where: {
      gpuName,
      archived: false,
      cachedAt: { lt: new Date(Date.now() - CACHED_LISTINGS_DURATION_MS) },
    },
    data: {
      archived: true,
      archivedAt,
    },
  })
  log.info(
    `Archiving stale listings for ${gpuName} complete. ${resp.count} archived.`,
  )
}

export type GpuPriceStats = {
  avgPrice: number
  minPrice: number
  maxPrice: number
  activeListingCount: number
  latestListingDate: Date
  /** Image URL from a representative listing, for use in structured data */
  representativeImageUrl: string | null
}

export async function getPriceStats(
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<GpuPriceStats> {
  // minPrice is calculated as the average of the 3 lowest priced listings
  // (or fewer if less than 3 listings exist) to provide a more stable price indicator
  const result = (await prisma.$queryRaw`
    SELECT
      AVG("priceValue"::float) as "avgPrice",
      (SELECT AVG(price) FROM (
        SELECT "priceValue"::float as price
        FROM "Listing"
        WHERE "gpuName" = ${gpuName} AND "archived" = false AND "exclude" = false
        ORDER BY "priceValue"::float ASC
        LIMIT 3
      ) lowest_three) as "minPrice",
      MAX("priceValue"::float) as "maxPrice",
      COUNT(*)::float as "activeListingCount",
      MAX("itemCreationDate") as "latestListingDate"
    FROM "Listing"
  WHERE
    "gpuName" = ${gpuName}
    AND "archived" = false
    AND "exclude" = false
  ;`) as GpuPriceStats[]

  if (result.length === 0) {
    log.error(`No price stats found for gpu ${gpuName}`)
    return {
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      activeListingCount: 0,
      latestListingDate: EPOCH,
      representativeImageUrl: null,
    }
  }

  // Get a representative image from the most recent active listing
  const listingWithImage = await prisma.listing.findFirst({
    where: { gpuName: gpuName, archived: false, exclude: false },
    select: { thumbnailImageUrl: true },
    orderBy: { itemCreationDate: "desc" },
  })

  return {
    ...result[0],
    representativeImageUrl: listingWithImage?.thumbnailImageUrl ?? null,
  }
}

/**
 * Maps Prisma TypeScript field names to actual database column names.
 * Currently no spec fields use @map, so this just returns the field name.
 * Kept for future flexibility if needed.
 */
function prismaFieldToDbColumn(fieldName: GpuMetricKey): string {
  return fieldName
}

/**
 * DEPRECATED: Use topNListingsByCostPerformanceBySlug instead.
 *
 * This function queries GPU table fields directly, which requires hardcoded
 * field mappings. The new function uses GpuMetricValue table instead.
 *
 * @deprecated Will be removed when GPU table benchmark fields are removed
 */
export async function topNListingsByCostPerformance(
  spec: GpuMetricKey,
  n: number,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Listing[]> {
  const dbColumnName = prismaFieldToDbColumn(spec)
  const specFieldName = Prisma.raw(`"gpu"."${dbColumnName}"`)

  type ListingWithGpu = Prisma.$ListingPayload["scalars"] &
    Prisma.$gpuPayload["scalars"]
  const result = await prisma.$queryRaw<ListingWithGpu[]>(Prisma.sql`
    SELECT
      *
    FROM "Listing"
    INNER JOIN "gpu" ON "Listing"."gpuName" = "gpu"."name"
    WHERE "Listing"."archived" = false
      AND "Listing"."exclude" = false
      AND ${specFieldName} IS NOT NULL
      AND ${specFieldName} > 0
    ORDER BY ("Listing"."priceValue"::float / ${specFieldName}::float)
    LIMIT ${n}
  `)

  return result.map((row: ListingWithGpu): Listing => {
    // Map database column names back to Prisma field names
    // This is needed because raw SQL returns DB column names, but we use Prisma field names
    if (dbColumnName !== spec) {
      // If the DB column name differs from the Prisma field name (e.g., 3dmarkWildLifeExtremeFps vs threemarkWildLifeExtremeFps)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(row as any)[spec] = (row as any)[dbColumnName]
    }

    // Construct the Listing object with all fields explicitly mapped
    // We explicitly construct the gpu object from the flattened row data
    const listing: Listing = {
      // Listing fields
      itemId: row.itemId,
      title: row.title,
      priceValue: row.priceValue,
      priceCurrency: row.priceCurrency,
      buyingOptions: row.buyingOptions,
      imageUrl: row.imageUrl,
      adultOnly: row.adultOnly,
      itemHref: row.itemHref,
      leafCategoryIds: row.leafCategoryIds,
      listingMarketplaceId: row.listingMarketplaceId,
      sellerUsername: row.sellerUsername,
      sellerFeedbackPercentage: row.sellerFeedbackPercentage,
      sellerFeedbackScore: row.sellerFeedbackScore,
      condition: row.condition,
      conditionId: row.conditionId,
      itemAffiliateWebUrl: row.itemAffiliateWebUrl,
      thumbnailImageUrl: row.thumbnailImageUrl,
      epid: row.epid,
      itemCreationDate: row.itemCreationDate,
      itemLocationCountry: row.itemLocationCountry,
      itemGroupType: row.itemGroupType,
      // GPU object with all specs and benchmarks
      gpu: {
        // Required fields
        name: row.name,
        label: row.label,
        gpuArchitecture: row.gpuArchitecture,
        supportedHardwareOperations: row.supportedHardwareOperations,
        summary: row.summary,
        references: row.references,
        lastModified: row.lastModified,
        // Optional fields - accessing via index signature since raw SQL flattens the result
        series: (row as Record<string, unknown>).series as
          | string
          | null
          | undefined,
        supportedCUDAComputeCapability:
          row.supportedCUDAComputeCapability ?? undefined,
        maxTDPWatts: row.maxTDPWatts ?? undefined,
        releaseDate: row.releaseDate ?? undefined,
        // All GPU metrics
        fp32TFLOPS: row.fp32TFLOPS,
        tensorCoreCount: row.tensorCoreCount,
        fp16TFLOPS: row.fp16TFLOPS,
        int8TOPS: row.int8TOPS,
        memoryCapacityGB: row.memoryCapacityGB,
        memoryBandwidthGBs: row.memoryBandwidthGBs,
        // MSRP and notes
        msrpUSD: row.msrpUSD ?? undefined,
        notes: row.notes ?? [],
      } satisfies Gpu,
    }

    return listing
  })
}

/**
 * Returns top N listings ordered by cost per performance using GpuMetricValue.
 *
 * This is the new implementation that uses the dynamic GpuMetricValue table
 * instead of hardcoded GPU table fields. It allows querying any metric
 * (spec or benchmark) by its slug without requiring schema changes.
 *
 * @param metricSlug - The metric slug (e.g., "fp32-flops", "counter-strike-2-fps-3840x2160")
 * @param n - Number of listings to return
 * @param prisma - Prisma client
 * @returns Listings ordered by cost/performance (lowest $/metric first)
 */
export async function topNListingsByCostPerformanceBySlug(
  metricSlug: string,
  n: number,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<ListingWithMetric[]> {
  // Query listings joined with GpuMetricValue to get cost/performance ordering
  // We join through gpu to get all GPU fields needed for the Listing.gpu object
  const result = await prisma.$queryRaw<
    (Prisma.$ListingPayload["scalars"] &
      Prisma.$gpuPayload["scalars"] & { metricValue: number })[]
  >(Prisma.sql`
    SELECT
      l.*,
      g.*,
      mv."value" as "metricValue"
    FROM "Listing" l
    INNER JOIN "gpu" g ON l."gpuName" = g."name"
    INNER JOIN "GpuMetricValue" mv ON g."name" = mv."gpuName"
    WHERE l."archived" = false
      AND l."exclude" = false
      AND mv."metricSlug" = ${metricSlug}
      AND mv."value" > 0
    ORDER BY (l."priceValue"::float / mv."value"::float)
    LIMIT ${n}
  `)

  return result.map((row): ListingWithMetric => {
    // Construct the ListingWithMetric object with all fields explicitly mapped
    const listing: ListingWithMetric = {
      // Listing fields
      itemId: row.itemId,
      title: row.title,
      priceValue: row.priceValue,
      priceCurrency: row.priceCurrency,
      buyingOptions: row.buyingOptions,
      imageUrl: row.imageUrl,
      adultOnly: row.adultOnly,
      itemHref: row.itemHref,
      leafCategoryIds: row.leafCategoryIds,
      listingMarketplaceId: row.listingMarketplaceId,
      sellerUsername: row.sellerUsername,
      sellerFeedbackPercentage: row.sellerFeedbackPercentage,
      sellerFeedbackScore: row.sellerFeedbackScore,
      condition: row.condition,
      conditionId: row.conditionId,
      itemAffiliateWebUrl: row.itemAffiliateWebUrl,
      thumbnailImageUrl: row.thumbnailImageUrl,
      epid: row.epid,
      itemCreationDate: row.itemCreationDate,
      itemLocationCountry: row.itemLocationCountry,
      itemGroupType: row.itemGroupType,
      // The metric value from GpuMetricValue for the queried metric slug
      metricValue: row.metricValue,
      // GPU object - note: we include legacy fields for backwards compatibility
      // but the metric value is retrieved from GpuMetricValue, not GPU table
      gpu: {
        // Required fields
        name: row.name,
        label: row.label,
        gpuArchitecture: row.gpuArchitecture,
        supportedHardwareOperations: row.supportedHardwareOperations,
        summary: row.summary,
        references: row.references,
        lastModified: row.lastModified,
        // Optional fields
        series: (row as Record<string, unknown>).series as
          | string
          | null
          | undefined,
        supportedCUDAComputeCapability:
          row.supportedCUDAComputeCapability ?? undefined,
        maxTDPWatts: row.maxTDPWatts ?? undefined,
        releaseDate: row.releaseDate ?? undefined,
        // GPU spec metrics from the GPU table
        fp32TFLOPS: row.fp32TFLOPS,
        tensorCoreCount: row.tensorCoreCount,
        fp16TFLOPS: row.fp16TFLOPS,
        int8TOPS: row.int8TOPS,
        memoryCapacityGB: row.memoryCapacityGB,
        memoryBandwidthGBs: row.memoryBandwidthGBs,
        // MSRP and notes
        msrpUSD: row.msrpUSD ?? undefined,
        notes: row.notes ?? [],
      } satisfies Gpu,
    }

    return listing
  })
}

// New types for historical data analysis
export interface PriceHistoryPoint {
  date: Date
  lowestAvgPrice: number
  medianPrice: number
  listingCount: number
}

export interface MonthlyPriceStats {
  gpuName: string
  monthYear: string
  avgPrice: number
  minPrice: number
  maxPrice: number
  activeListingCount: number
  priceVolatility: number
}

export interface AvailabilityStats {
  date: Date
  availableListings: number
  uniqueSellers: number
  avgDaysListed: number
}

export interface VolatilityStats {
  gpuName: string
  volatilityScore: number
  priceRange: number
  versionCount: number
}

/**
 * Gets historical price data for a GPU over the specified number of months.
 *
 * IMPORTANT: This query intentionally includes BOTH active and archived listings
 * to provide complete historical price data. Do NOT add an archived=false filter
 * to this query - archived listings are essential for historical analysis.
 */
export async function getHistoricalPriceData(
  gpuName: string,
  months: number,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<PriceHistoryPoint[]> {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  // Calculate daily stats with lowestAvgPrice (avg of 3 lowest listings per day)
  // Using LATERAL join for efficient per-day calculation
  // NOTE: Includes archived listings for historical analysis, but excludes data quality issues
  const result = await prisma.$queryRaw<PriceHistoryPoint[]>`
    SELECT
      d."date",
      COALESCE(l."lowestAvgPrice", d."medianPrice") as "lowestAvgPrice",
      d."medianPrice",
      d."listingCount"
    FROM (
      SELECT
        DATE_TRUNC('day', "cachedAt") as "date",
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "priceValue"::float) as "medianPrice",
        COUNT(*)::float as "listingCount"
      FROM "Listing"
      WHERE
        "gpuName" = ${gpuName}
        AND "cachedAt" >= ${startDate}
        AND "exclude" = false
      GROUP BY DATE_TRUNC('day', "cachedAt")
    ) d
    LEFT JOIN LATERAL (
      SELECT AVG(sub.price) as "lowestAvgPrice"
      FROM (
        SELECT "priceValue"::float as price
        FROM "Listing"
        WHERE "gpuName" = ${gpuName}
          AND DATE_TRUNC('day', "cachedAt") = d."date"
          AND "exclude" = false
        ORDER BY "priceValue"::float ASC
        LIMIT 3
      ) sub
    ) l ON TRUE
    ORDER BY d."date"
  `

  return result
}

/**
 * Gets monthly averages for multiple GPUs for a specific month
 */
export async function getMonthlyAverages(
  gpuNames: string[],
  monthYear: string, // Format: "2024-01"
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<MonthlyPriceStats[]> {
  const [year, month] = monthYear.split("-").map(Number)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  // NOTE: Includes archived listings for historical analysis, but excludes data quality issues
  const result = await prisma.$queryRaw<
    Omit<MonthlyPriceStats, "priceVolatility">[]
  >`
    SELECT
      "gpuName",
      ${monthYear} as "monthYear",
      AVG("priceValue"::float) as "avgPrice",
      MIN("priceValue"::float) as "minPrice",
      MAX("priceValue"::float) as "maxPrice",
      COUNT(*)::float as "activeListingCount"
    FROM "Listing"
    WHERE
      "gpuName" = ANY(${gpuNames})
      AND "cachedAt" >= ${startDate}
      AND "cachedAt" <= ${endDate}
      AND "exclude" = false
    GROUP BY "gpuName"
  `

  // Calculate volatility for each GPU
  const volatilityResults = await prisma.$queryRaw<
    { gpuName: string; priceVolatility: number }[]
  >`
    SELECT
      "gpuName",
      CASE
        WHEN AVG("priceValue"::float) > 0
        THEN STDDEV("priceValue"::float) / AVG("priceValue"::float)
        ELSE 0
      END as "priceVolatility"
    FROM "Listing"
    WHERE
      "gpuName" = ANY(${gpuNames})
      AND "cachedAt" >= ${startDate}
      AND "cachedAt" <= ${endDate}
      AND "exclude" = false
    GROUP BY "gpuName"
  `

  const volatilityMap = new Map(
    volatilityResults.map((v) => [v.gpuName, v.priceVolatility]),
  )

  return result.map((stat) => ({
    ...stat,
    priceVolatility: volatilityMap.get(stat.gpuName) || 0,
  }))
}

/**
 * Gets availability trends for a GPU over the specified number of months
 */
export async function getAvailabilityTrends(
  gpuName: string,
  months: number,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<AvailabilityStats[]> {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  // NOTE: Includes archived listings for historical analysis, but excludes data quality issues
  const result = await prisma.$queryRaw<AvailabilityStats[]>`
    SELECT
      DATE_TRUNC('day', "cachedAt") as "date",
      COUNT(*)::float as "availableListings",
      COUNT(DISTINCT "sellerUsername")::float as "uniqueSellers",
      AVG(EXTRACT(EPOCH FROM ("cachedAt" - "itemCreationDate")) / 86400)::float as "avgDaysListed"
    FROM "Listing"
    WHERE
      "gpuName" = ${gpuName}
      AND "cachedAt" >= ${startDate}
      AND "itemCreationDate" IS NOT NULL
      AND "exclude" = false
    GROUP BY DATE_TRUNC('day', "cachedAt")
    ORDER BY "date"
  `

  return result
}

/**
 * Gets price volatility statistics for a GPU over the specified number of months
 */
export async function getPriceVolatility(
  gpuName: string,
  months: number,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<VolatilityStats> {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  // NOTE: Includes archived listings for historical analysis, but excludes data quality issues
  const result = await prisma.$queryRaw<VolatilityStats[]>`
    SELECT
      ${gpuName} as "gpuName",
      CASE
        WHEN AVG("priceValue"::float) > 0
        THEN STDDEV("priceValue"::float) / AVG("priceValue"::float)
        ELSE 0
      END as "volatilityScore",
      (MAX("priceValue"::float) - MIN("priceValue"::float)) as "priceRange",
      COUNT(DISTINCT "version")::float as "versionCount"
    FROM "Listing"
    WHERE
      "gpuName" = ${gpuName}
      AND "cachedAt" >= ${startDate}
      AND "exclude" = false
  `

  return (
    result[0] || {
      gpuName,
      volatilityScore: 0,
      priceRange: 0,
      versionCount: 0,
    }
  )
}

/**
 * Lists archived listings for a GPU within a date range
 */
export async function listArchivedListings(
  gpuName: string,
  startDate: Date,
  endDate: Date,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<CachedListing[]> {
  const listings = await prisma.listing.findMany({
    where: {
      gpuName,
      archived: true,
      archivedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      gpu: true,
    },
    orderBy: {
      archivedAt: "desc",
    },
  })

  return listings.map((listing) => parsePrismaListingWithGpu(listing))
}

/**
 * Gets the version history for a specific listing itemId
 */
export async function getListingVersionHistory(
  itemId: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<CachedListing[]> {
  const listings = await prisma.listing.findMany({
    where: {
      itemId,
    },
    include: {
      gpu: true,
    },
    orderBy: {
      version: "desc",
    },
  })

  return listings.map((listing) => parsePrismaListingWithGpu(listing))
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA QUALITY EXCLUSION METHODS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Excludes a listing for data quality issues.
 * Unlike archive, excluded listings are omitted from ALL queries including historical.
 * The listing is preserved for potential ML training to detect similar issues.
 *
 * @param itemId - The eBay item ID of the listing to exclude
 * @param reason - The reason for exclusion (see EXCLUDE_REASONS in listing.ts)
 * @param prisma - Prisma client
 */
export async function excludeListingForDataQuality(
  itemId: string,
  reason: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<void> {
  await prisma.listing.updateMany({
    where: {
      itemId,
      archived: false,
    },
    data: {
      exclude: true,
      excludeReason: reason,
    },
  })
  log.info(`Excluded listing ${itemId} for data quality issue: ${reason}`)
}

/**
 * Lists excluded listings for analysis/ML training.
 * Supports filtering by reason and GPU name, with pagination.
 *
 * @param options - Filter and pagination options
 * @param prisma - Prisma client
 * @returns Excluded listings and total count
 */
export async function listExcludedListings(
  options: {
    reason?: string
    gpuName?: string
    limit?: number
    offset?: number
  } = {},
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<{ listings: CachedListing[]; total: number }> {
  const DEFAULT_LIMIT = 100
  const { reason, gpuName, limit = DEFAULT_LIMIT, offset = 0 } = options

  const where: Prisma.ListingWhereInput = {
    exclude: true,
    ...(reason ? { excludeReason: reason } : {}),
    ...(gpuName ? { gpuName } : {}),
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        gpu: true,
      },
      orderBy: {
        cachedAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.listing.count({ where }),
  ])

  return {
    listings: listings.map((listing) => parsePrismaListingWithGpu(listing)),
    total,
  }
}

/**
 * Gets summary stats of excluded listings by reason.
 * Useful for monitoring data quality issues over time.
 *
 * @param prisma - Prisma client
 * @returns Array of reason/count pairs, sorted by count descending
 */
export async function getExclusionStats(
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<{ reason: string; count: number }[]> {
  const result = await prisma.$queryRaw<{ reason: string; count: bigint }[]>`
    SELECT
      COALESCE("excludeReason", 'unknown') as "reason",
      COUNT(*)::bigint as "count"
    FROM "Listing"
    WHERE "exclude" = true
    GROUP BY "excludeReason"
    ORDER BY "count" DESC
  `

  return result.map((row) => ({
    reason: row.reason,
    count: Number(row.count),
  }))
}
