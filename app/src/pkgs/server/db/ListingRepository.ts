import { Listing } from "@/pkgs/isomorphic/model"
import { createDiag } from "@activescott/diag"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { omit } from "lodash"

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
  log.info(`Adding ${listings.length} listings for ${gpuName}`)

  // NOTE: prisma doesn't like the hydrated gpu object in thelistings, so we omit them here and only add gpuName
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
  log.info(`Marking stale listings for ${gpuName}`)
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

export async function getAverageGpuPrice(
  gpuName: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<number> {
  const result =
    (await prisma.$queryRaw`select AVG("priceValue"::float) from "Listing"
  WHERE "gpuName" = ${gpuName};`) as RowWithAvg[]

  if (result.length === 0 || !result[0].avg) {
    return 0
  }
  return result[0].avg
}

type RowWithAvg = { avg: number }
