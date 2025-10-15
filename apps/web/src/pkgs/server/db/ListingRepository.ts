import { Listing } from "@/pkgs/isomorphic/model"
import { createDiag } from "@activescott/diag"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { omit, pick, throttle } from "lodash"
import { GpuSpecKey, GpuSpecKeys } from "@/pkgs/isomorphic/model/specs"
import { Prisma } from "@prisma/client"
import { CACHED_LISTINGS_DURATION_MS } from "../cacheConfig"
import { EPOCH, minutesToMilliseconds } from "@/pkgs/isomorphic/duration"
import { createHash } from "crypto"

const log = createDiag("shopping-agent:ListingRepository")

/* We keep cachedAt in the DB and it is used in the ListingRepository and in Listings */
export type CachedListing = Listing & { cachedAt: Date }

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
  const res = prisma.listing.findMany({
    where: {
      gpuName: { in: gpuNames },
      archived: false,
    },
    include: {
      gpu: true,
    },
  })
  return res
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
        },
      },
    },
  })

  const result = gpus.map((gpu) => ({
    // NOTE: The returned listing doesn't have the gpu field hydrated, so we add it here
    listings: gpu.Listing.map((listing) => ({ ...listing, gpu })),
    gpuName: gpu.name,
  }))
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
    ...(includeTestGpus ? {} : { gpuName: { not: "test-gpu" } }),
  }
  const res = prisma.listing.findMany({
    where: where,
    include: {
      gpu: true,
    },
  })
  return res
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

const THROTTLE_MINUTES = 10
/**
 * Returns the latest creation date across all listings, with a throttle to prevent excessive queries.
 */
export const getLatestListingDateWithThrottle = throttle(
  getLatestListingDate,
  minutesToMilliseconds(THROTTLE_MINUTES),
)

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
      `No listings specified to add or refresh for gpu ${gpuName}. Aborting attempt to cache new listings.`,
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
    `Processing listings for ${gpuName} complete. ` +
      `Created: ${createdCount}, Archived: ${archivedCount}, Unchanged: ${noChangeCount}`,
  )
}

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
  activeListingCount: number
  latestListingDate: Date
}

export async function getPriceStats(
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<GpuPriceStats> {
  const result = (await prisma.$queryRaw`
    SELECT 
      AVG("priceValue"::float) as "avgPrice", 
      MIN("priceValue"::float) as "minPrice", 
      COUNT(*)::float as "activeListingCount",
      MAX("itemCreationDate") as "latestListingDate"
    FROM "Listing"
  WHERE 
    "gpuName" = ${gpuName}
    AND "archived" = false
  ;`) as GpuPriceStats[]

  if (result.length === 0) {
    log.error(`No price stats found for gpu ${gpuName}`)
    return {
      avgPrice: 0,
      minPrice: 0,
      activeListingCount: 0,
      latestListingDate: EPOCH,
    }
  }
  return result[0]
}

export async function topNListingsByCostPerformance(
  spec: GpuSpecKey,
  n: number,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Listing[]> {
  const specFieldName = Prisma.raw(`"gpu"."${spec}"`)

  type ListingWithGpu = Prisma.$ListingPayload["scalars"] &
    Prisma.$gpuPayload["scalars"]
  const result = await prisma.$queryRaw<ListingWithGpu[]>(Prisma.sql`
    SELECT 
      *
    FROM "Listing"
    INNER JOIN "gpu" ON "Listing"."gpuName" = "gpu"."name"
    WHERE "Listing"."archived" = false
    ORDER BY ("Listing"."priceValue"::float / ${specFieldName}::float)
    LIMIT ${n}
  `)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.map((row: ListingWithGpu) => {
    const listing = omit(row, "gpu")
    const gpuSpecs = pick(row, GpuSpecKeys)
    const gpuKeys = [
      "name",
      "label",
      "lastCachedListings",
      "summary",
      "references",
    ] as (keyof ListingWithGpu)[]
    const gpu = pick(row, gpuKeys)

    return {
      ...listing,
      gpu: {
        ...gpu,
        ...gpuSpecs,
      },
    }
  })
}

// New types for historical data analysis
export interface PriceHistoryPoint {
  date: Date
  avgPrice: number
  minPrice: number
  maxPrice: number
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
 * Gets historical price data for a GPU over the specified number of months
 */
export async function getHistoricalPriceData(
  gpuName: string,
  months: number,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<PriceHistoryPoint[]> {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const result = await prisma.$queryRaw<PriceHistoryPoint[]>`
    SELECT 
      DATE_TRUNC('day', "cachedAt") as "date",
      AVG("priceValue"::float) as "avgPrice",
      MIN("priceValue"::float) as "minPrice", 
      MAX("priceValue"::float) as "maxPrice",
      COUNT(*)::float as "listingCount"
    FROM "Listing"
    WHERE 
      "gpuName" = ${gpuName}
      AND "cachedAt" >= ${startDate}
    GROUP BY DATE_TRUNC('day', "cachedAt")
    ORDER BY "date"
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
  const result = await prisma.listing.findMany({
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

  return result
}

/**
 * Gets the version history for a specific listing itemId
 */
export async function getListingVersionHistory(
  itemId: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<CachedListing[]> {
  const result = await prisma.listing.findMany({
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

  return result
}
