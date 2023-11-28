import { createDiag } from "@activescott/diag"
import { ItemSummary } from "ebay-client"
import { Metadata } from "next"
import { getListings } from "@/pkgs/server/listings"
import { GpuSpecs } from "@/pkgs/isomorphic/specs"
import { ListingGallery } from "@/pkgs/client/components/ListingGallery"

const log = createDiag("shopping-agent:shop:nvidia-t4")

// revalidate the data at most every hour:
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Price Compare NVIDIA T4 GPUs",
  description: "Compare prices for NVIDIA T4 GPUs",
  alternates: { canonical: "https://coinpoet.com/shop/nvidia-t4" },
}

const cardName = "NVIDIA T4"

export default async function Page() {
  const iterableItems = await getListings()

  // TODO: add a slice function to irritable-iterable
  const items: ItemSummary[] = []
  let count = 0

  // TODO: Eliminate this loop. Add first(n) to irritable-iterable
  for await (const item of iterableItems) {
    // filter items:
    if (typeof item.itemAffiliateWebUrl !== "string") {
      log.error("item has no affiliate link", item.itemId)
      continue
    }
    if (!item.buyingOptions.includes("FIXED_PRICE")) {
      log.info("item is not fixed price", item.itemId)
      continue
    }

    // if it doesn't include some required keywords, it's probably not a card, so don't s how it:
    const requiredKeywords = ["16gb", "t4"]
    if (
      !requiredKeywords.every((requiredKeyword) =>
        item.title.toLowerCase().includes(requiredKeyword),
      )
    ) {
      // log any that don't appear to be common infractions:
      const commonMistakeWords = [
        "bracket",
        "geforce",
        "quadro",
        "fan attachment",
        "fan adapter",
        "Shroud",
        "blower fan",
        "FX 5500",
      ].map((word) => word.toLowerCase())
      if (
        !commonMistakeWords.some((accessory) =>
          item.title.toLowerCase().includes(accessory),
        )
      ) {
        log.warn(
          `item title doesn't include required keyword and isn't a common accessory: %s: %s`,
          item.itemId,
          item.title,
        )
      }
      continue
    }
    items.push(item)
    // eslint-disable-next-line no-magic-numbers
    if (++count > 50) {
      break
    }
  }

  return (
    <main>
      <h1>{cardName} Listings</h1>
      <ListingGallery
        listings={items.map((item) => ({ item, specs: NVIDIA_T4_SPECS }))}
      />
    </main>
  )
}

const NVIDIA_T4_SPECS: GpuSpecs = {
  tensorCoreCount: 320,
  fp32TFLOPS: 8.1,
  fp16TFLOPS: 65,
  int8TOPS: 130,
  memoryCapacityGB: 16,
  memoryBandwidthGBs: 320,
}
