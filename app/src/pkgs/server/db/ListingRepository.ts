import { Listing } from "@/pkgs/isomorphic/model"
import { createDiag } from "@activescott/diag"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { omit, pick } from "lodash"
import { GpuSpecKey, GpuSpecKeys } from "@/pkgs/isomorphic/model/specs"
import { Prisma } from "@prisma/client"

const log = createDiag("shopping-agent:ListingRepository")

export async function listListingsForGpu(
  gpuName: string,
  includeStale: boolean = false,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<Listing[]> {
  const res = prisma.listing.findMany({
    where: {
      gpuName,
      stale: includeStale,
    },
    include: {
      gpu: true,
    },
  })
  return res
}

export async function addListingsForGpu(
  listings: Listing[],
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<void> {
  log.info(`Adding ${listings.length} listings for ${gpuName}...`)

  // NOTE: prisma doesn't like the hydrated gpu object in the listings, so we omit them here and only add gpuName
  const mapped = listings.map((listing) => ({
    ...omit(listing, "gpu"),
    gpuName,
  }))
  await prisma.listing.createMany({
    data: mapped,
    skipDuplicates: true,
  })
  log.info(`Adding ${listings.length} listings for ${gpuName} completed.`)
}

export async function markListingsStaleForGpu(
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<void> {
  log.info(`Marking stale listings for ${gpuName}...`)
  await prisma.listing.updateMany({
    where: {
      gpuName,
    },
    data: {
      stale: true,
    },
  })

  log.info(`Marking stale listings for ${gpuName} completed.`)
}

export async function markListingsFreshForGpu(
  gpuName: string,
  listings: Listing[],
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<void> {
  log.info(`Marking fresh listings for ${gpuName}`)
  await prisma.listing.updateMany({
    where: {
      itemId: {
        in: listings.map((listing) => listing.itemId),
      },
      gpuName: gpuName,
      stale: true,
    },
    data: {
      stale: false,
    },
  })
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
    AND "stale" = false
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
    WHERE "Listing"."stale" = false
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
