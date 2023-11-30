import { createDiag } from "@activescott/diag"
import { Metadata } from "next"
import { fetchListingsWithCache } from "@/pkgs/server/listings"
import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import { getGpu } from "@/pkgs/server/db/GpuRepository"
import { Gpu } from "@/pkgs/isomorphic/model"
import { chain } from "irritable-iterable"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { Integer } from "type-fest"

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
  const NVIDIA_T4_SPECS: Gpu = await getGpu("nvidia-t4")
  const allListings = await fetchListingsWithCache("nvidia-t4")
  const listings = chain(allListings)
    .filter((item) => {
      if (typeof item.itemAffiliateWebUrl !== "string") {
        log.error("item has no affiliate link", item.itemId)
        return false
      }
      if (!item.buyingOptions.includes("FIXED_PRICE")) {
        log.info("item is not fixed price", item.itemId)
        return false
      }
      return true
    })
    .filter((item) => {
      // if it doesn't include some required keywords, it's probably not a card, so don't show it:
      const requiredKeywords = ["16gb", "t4"]
      if (
        !requiredKeywords.every((requiredKeyword) =>
          item.title.toLowerCase().includes(requiredKeyword),
        )
      ) {
        // log any that don't appear to be common non-cards:
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
        return false
      }
      return true
    })
    .head(ISOMORPHIC_CONFIG.MAX_LISTINGS_PER_PAGE() as Integer<number>)
    .collect()

  return (
    <main>
      <h1>{cardName} Listings</h1>
      <ListingGallery
        listings={listings.map((item) => ({
          item,
          specs: NVIDIA_T4_SPECS,
        }))}
      />
    </main>
  )
}
