import { createDiag } from "@activescott/diag"
import { Gpu, Listing } from "../isomorphic/model"

const log = createDiag("shopping-agent:shop:listingFilters")

/**
 * A filter that is suitable for all GPUs
 */
function allListingFilters(item: Listing): boolean {
  if (typeof item.itemAffiliateWebUrl !== "string") {
    log.error("item has no affiliate link", item.itemId)
    return false
  }
  if (!item.buyingOptions.includes("FIXED_PRICE")) {
    log.debug("item is not fixed price", item.itemId)
    return false
  }
  if (item.itemGroupType === "SELLER_DEFINED_VARIATIONS") {
    // some of them shove a bunch of different types of GPUs into one listing, but the listing returns the lowest price so it makes the item appear artificially cheap
    log.debug("item has SELLER_DEFINED_VARIATIONS", item.itemId)
    return false
  }
  return true
}

const conditionFilter = (item: Listing): boolean => {
  // https://developer.ebay.com/devzone/finding/CallRef/Enums/conditionIdList.html
  const FOR_PARTS_NOT_WORKING = "7000"
  return item.conditionId !== FOR_PARTS_NOT_WORKING
}

type Predicate = (item: Listing) => boolean

/**
 * Creates a filter for filtering listings for the specified GPU.
 */
export function createFilterForGpu(gpu: Gpu): Predicate {
  const requiredKeywordsFilter = createRequiredLabelFilter(gpu)

  return composePredicates(
    sellerFeedbackFilter,
    allListingFilters,
    conditionFilter,
    requiredKeywordsFilter,
    createRequireMemoryKeywordFilter(gpu),
    gpuAccessoryFilter,
  )
}

function createRequireMemoryKeywordFilter(gpu: Gpu) {
  const requiredKeywords = [
    `${gpu.memoryCapacityGB}gb`,
    `${gpu.memoryCapacityGB} gb`,
    `${gpu.memoryCapacityGB}g`,
    `${gpu.memoryCapacityGB} g`,
  ]
  return createRequireKeywordsPredicate(requiredKeywords, false)
}

function createRequiredLabelFilter(gpu: Gpu) {
  const nameKeywords = gpu.label.split(" ")
  const requiredKeywords = [...nameKeywords].map((word) => word.toLowerCase())
  return createRequireKeywordsPredicate(requiredKeywords)
}

function createRequireKeywordsPredicate(
  keywords: string[],
  requireAllKeywords = true,
) {
  return (item: Listing): boolean => {
    // if it doesn't include some required keywords, it's probably not a card, so don't show it:
    const includeListing = requireAllKeywords
      ? keywords.every((requiredKeyword) =>
          item.title.toLowerCase().includes(requiredKeyword),
        )
      : keywords.some((requiredKeyword) =>
          item.title.toLowerCase().includes(requiredKeyword),
        )

    if (!includeListing && !isExpectedToBeFilteredOut(item)) {
      log.debug(
        "required keywords not in item title: %o. Item title: %s . Item Url: %s",
        keywords.filter(
          (requiredKeyword) =>
            !item.title.toLowerCase().includes(requiredKeyword),
        ),
        item.title,
        item.itemAffiliateWebUrl,
      )
    }
    return includeListing
  }
}

const nonGpuKeywords = [
  "bracket",
  "fan attachment",
  "fan adapter",
  "shroud",
  "blower fan",
  "NO GPU",
  "fan kit",
  "fan for",
  "kit for",
  // Filtering out SXM sockets because people usually are going to want PCIe
  "SXM",
  // surprisingly, many people misspell SXM as SMX in listing titles:
  "SMX",
  // I've seen some cards in china that read "neutered 4GB" apparently indicating that the card has been modified to have less memory than it originally had:
  "neutered",
  // e.g. "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6 Box Only" which only includes the box but has all other specs
  "Box Only",
].map((word) => word.toLowerCase())

function gpuAccessoryFilter(item: Listing): boolean {
  if (
    nonGpuKeywords.some((accessory) =>
      item.title.toLowerCase().includes(accessory),
    )
  ) {
    log.debug(
      "item filtered out as a accessory: %s %s",
      item.title,
      item.itemAffiliateWebUrl,
    )
    return false
  }
  return true
}

export function sellerFeedbackFilter(
  item: Pick<Listing, "sellerFeedbackPercentage" | "itemAffiliateWebUrl">,
): boolean {
  // filter out sellers with <90% feedback
  const MINIMUM_FEEDBACK_PERCENTAGE = 90
  if (
    item.sellerFeedbackPercentage &&
    Number.parseInt(item.sellerFeedbackPercentage) >=
      MINIMUM_FEEDBACK_PERCENTAGE
  ) {
    return true
  }
  log.debug(
    "item filtered out as a low feedback seller: %s %s",
    item.sellerFeedbackPercentage,
    item.itemAffiliateWebUrl,
  )
  return false
}

function isExpectedToBeFilteredOut(item: Listing): boolean {
  // log any that don't appear to be common non-cards:
  // some GPUs that we *never* want that I've found that show up in NVIDIA T4 searches that aren't T4s:
  const wrongGpuKeywords = [
    "GeForce RTX 3060",
    "Geforce RTX 3070",
    "GeForce RTX 3080",
    "GEFORCE GTX960",
    "GEFORCE GTX 960",
    "GEFORCE GTX 980",
    "GTX1050Ti",
    "GEFORCE GTX 770",
    "GeForce GTX 1050",
    "FX 5500",
    "Quadro",
    // A5000 16GB (QN20-E5-A1) is a mobile GPU that wasn't benchmarked: https://www.techpowerup.com/gpu-specs/rtx-a5000-mobile.c3805
    "A5000 16GB",
    "QN20-E5-A1",
  ].map((word) => word.toLowerCase())

  if (
    nonGpuKeywords.some((accessory) =>
      item.title.toLowerCase().includes(accessory),
    )
  ) {
    return true
  }
  if (
    wrongGpuKeywords.some((accessory) =>
      item.title.toLowerCase().includes(accessory),
    )
  ) {
    return true
  }
  return false
}

function composePredicates(...predicates: Predicate[]): Predicate {
  return (item: Listing) => {
    return predicates.every((predicate) => predicate(item))
  }
}
