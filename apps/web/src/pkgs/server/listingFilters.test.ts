import { loadGpuFromYaml } from "@/testing/gpuFiles"
import { Listing } from "../isomorphic/model"
import { chainAsync } from "irritable-iterable"
import { createFilterForGpu } from "./listingFilters"
import { arrayToAsyncIterable } from "../isomorphic/collection"

it("should filter out box-only items", async () => {
  const gpu = await loadGpuFromYaml("amd-radeon-rx-7800-xt.yaml")

  // "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6 Box Only"
  const listings: AsyncIterable<Listing> = arrayToAsyncIterable([
    {
      title: "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6 Box Only",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
    },
    // the ONE good listing:
    {
      title: "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
    },
    {
      title: "Box Only, Gigabyte Radeon Rx 7800 XT Gaming OC",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
    },
    {
      title: "PowerColor Red Devil Radeon RX 580 8gb GDDR5 *BOX ONLY*",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
    },
    {
      title: "AMD Radeon RX6600 BOX ONLY Various brands",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
    },
    {
      title: "AMD RX 7800 ** BOX ONLY",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
    },
    {
      title: "GIGABYTE AORUS RADEON RX 580 8GB GDDR5 *BOX ONLY NO GPU*",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
    },
    // HACK cast for test purposes
  ] as unknown as Listing[])

  const filtered = await chainAsync(listings)
    .filter(createFilterForGpu(gpu))
    .collect()

  expect(filtered).toHaveLength(1)
})
