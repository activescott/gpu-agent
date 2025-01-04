import { Listing } from "@/pkgs/isomorphic/model"
import { createDiag } from "@activescott/diag"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { omit, pick } from "lodash"
import { GpuSpecKey, GpuSpecKeys } from "@/pkgs/isomorphic/model/specs"
import { Prisma } from "@prisma/client"
import { CACHED_LISTINGS_DURATION_MS } from "../cacheConfig"

const log = createDiag("shopping-agent:ListingRepository")

/* We keep cachedAt in the DB and it is used in the ListingRepository and in Listings */
export type CachedListing = Listing & { cachedAt: Date }

export async function listCachedListingsForGpus(
  gpuNames: string[],
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<CachedListing[]> {
  const res = prisma.listing.findMany({
    where: {
      gpuName: { in: gpuNames },
    },
    include: {
      gpu: true,
    },
  })
  return res
}

/**
 * Returns the set of cached listings for all GPUs. Some listings may be empty.
 * NOTE: This is a useful operation since it allows pulling both a complete list of all GPUs, AND their associated listings (which may be empty).
 * If the listings are empty, the caller can then decide to fetch new listings to cache for the GPU.
 */
export async function listCachedListingsGroupedByGpu(
  includeTestGpus: boolean = false,
  prisma: PrismaClientWithinTransaction,
): Promise<
  {
    listings: CachedListing[]
    gpuName: string
  }[]
> {
  const where = {} as Prisma.gpuWhereInput
  if (!includeTestGpus) {
    where.name = { not: "test-gpu" }
  }

  const gpus = await prisma.gpu.findMany({
    where,
    include: {
      Listing: true,
    },
  })

  const result = gpus.map((gpu) => ({
    // NOTE: The returned listing doesn't have the gpu field hydrated, so we add it here
    listings: gpu.Listing.map((listing) => ({ ...listing, gpu })),
    gpuName: gpu.name,
  }))
  return result
}

export async function listCachedListings(
  includeTestGpus: boolean = false,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<CachedListing[]> {
  const where: Prisma.ListingWhereInput = includeTestGpus
    ? {}
    : { gpuName: { not: "test-gpu" } }
  const res = prisma.listing.findMany({
    where: where,
    include: {
      gpu: true,
    },
  })
  return res
}

/**
 * Adds or updates the specified listings in the database.
 * You must supply a prisma client that is already wrapped in a transaction, as the upsert operation is many queries.
 */
export async function addOrRefreshListingsForGpu(
  listings: Listing[],
  gpuName: string,
  prisma: PrismaClientWithinTransaction,
): Promise<void> {
  log.info(`Creating listings for ${gpuName}...`)
  if (listings.length === 0) {
    log.warn(
      `No listings specified to add or refresh for gpu ${gpuName}. Aborting attempt to cache new listings.`,
    )
    return
  }

  const cachedAt = new Date()
  const mapped = listings.map((listing) => ({
    // NOTE: prisma doesn't like the hydrated gpu field in the listing, so we omit them here and only add gpuName
    ...omit(listing, "gpu"),
    gpuName,
    cachedAt,
  }))

  // NOTE: We delete before inserting in case the listing itself changed in someway in eBay:
  log.info(`Deleting existing listings for gpu name ${gpuName}...`)
  const deleteResult = await prisma.listing.deleteMany({
    where: {
      itemId: {
        in: mapped.map((listing) => listing.itemId),
      },
    },
  })
  log.info(
    `Deleting existing listings for gpu name ${gpuName} complete. Deleted ${deleteResult.count} listings.`,
  )

  // create
  log.info(`Creating ${mapped.length} listings for gpu ${gpuName}...`)
  const createResult = await prisma.listing.createMany({
    data: mapped,
  })
  log.info(
    `Creating listings for gpu ${gpuName} complete. Created ${createResult.count} listings.`,
  )
}

export async function deleteStaleListingsForGpu(
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<void> {
  log.info(`Deleting stale listings for ${gpuName}`)
  const resp = await prisma.listing.deleteMany({
    where: {
      gpuName,
      cachedAt: { lt: new Date(Date.now() - CACHED_LISTINGS_DURATION_MS) },
    },
  })
  log.info(
    `Deleting stale listings for ${gpuName} complete. ${resp.count} deleted.`,
  )
}

export async function getPriceStats(
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<{ avgPrice: number; minPrice: number; activeListingCount: number }> {
  type RowShape = { avgPrice: number; minPrice: number; count: number }

  const result = (await prisma.$queryRaw`select 
    AVG("priceValue"::float) as "avgPrice", 
    MIN("priceValue"::float) as "minPrice", 
    COUNT(*)::float as count from "Listing"
  WHERE 
    "gpuName" = ${gpuName}
    AND "cachedAt" > ${new Date(Date.now() - CACHED_LISTINGS_DURATION_MS)}
  ;`) as RowShape[]

  if (result.length === 0) {
    return { avgPrice: 0, minPrice: 0, activeListingCount: 0 }
  }
  return {
    avgPrice: result[0].avgPrice,
    minPrice: result[0].minPrice,
    activeListingCount: result[0].count,
  }
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
    WHERE "Listing"."cachedAt" > ${new Date(
      Date.now() - CACHED_LISTINGS_DURATION_MS,
    )}
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
