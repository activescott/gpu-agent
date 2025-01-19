import { loadGpuFromYaml } from "@/testing/gpuFiles"
import { Listing } from "../isomorphic/model"
import { chainAsync } from "irritable-iterable"
import { createFilterForGpu, sellerFeedbackFilter } from "./listingFilters"
import { arrayToAsyncIterable } from "../isomorphic/collection"

it("should filter out box-only items", async () => {
  const gpu = await loadGpuFromYaml("amd-radeon-rx-7800-xt.yaml")

  // "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6 Box Only"
  const listings: AsyncIterable<Listing> = arrayToAsyncIterable([
    {
      title: "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6 Box Only",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
      sellerFeedbackPercentage: "100",
    },
    // the ONE good listing:
    {
      title: "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
      sellerFeedbackPercentage: "100",
    },
    {
      title: "Box Only, Gigabyte Radeon Rx 7800 XT Gaming OC",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
      sellerFeedbackPercentage: "100",
    },
    {
      title: "PowerColor Red Devil Radeon RX 580 8gb GDDR5 *BOX ONLY*",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
      sellerFeedbackPercentage: "100",
    },
    {
      title: "AMD Radeon RX6600 BOX ONLY Various brands",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
      sellerFeedbackPercentage: "100",
    },
    {
      title: "AMD RX 7800 ** BOX ONLY",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
      sellerFeedbackPercentage: "100",
    },
    {
      title: "GIGABYTE AORUS RADEON RX 580 8GB GDDR5 *BOX ONLY NO GPU*",
      itemAffiliateWebUrl: "https://example.com",
      buyingOptions: ["FIXED_PRICE"],
      sellerFeedbackPercentage: "100",
    },
    // HACK cast for test purposes
  ] as unknown as Listing[])

  const filtered = await chainAsync(listings)
    .filter(createFilterForGpu(gpu))
    .collect()

  expect(filtered).toHaveLength(1)
})

describe("sellerFeedbackFilter", () => {
  it("should filter out sellers with <90% feedback", async () => {
    const listings = [
      {
        itemId: "v1|186889393298|0",
        title: "NVIDIA Tesla H100 80GB PCIe 5.0 Deep Learning GPU",
        leafCategoryIds: ["27386"],
        categories: [],
        image: {
          imageUrl:
            "https://i.ebayimg.com/images/g/Se8AAOSw-fpniwuO/s-l225.jpg",
        },
        price: {
          value: "878.99",
          currency: "USD",
        },
        itemHref:
          "https://api.ebay.com/buy/browse/v1/item/v1%7C186889393298%7C0",
        sellerFeedbackPercentage: "0.0",
        sellerFeedbackScore: 0,
        condition: "New",
        conditionId: "1000",
      },
      {
        itemId: "v1|bbb|1",
        //sellerFeedbackPercentage: "0.0", // NOTE: NO field at all
        sellerFeedbackScore: 0,
      },
      {
        itemId: "v1|ccc|1",
        sellerFeedbackPercentage: "100.0",
        sellerFeedbackScore: 0,
      },
      {
        itemId: "v1|ddd|1",
        sellerFeedbackPercentage: "99.0",
        sellerFeedbackScore: 0,
      },
      {
        itemId: "v1|aaa|1",
        sellerFeedbackPercentage: "0.0",
        sellerFeedbackScore: 0,
      },
      {
        itemId: "v1|eee|1",
        sellerFeedbackPercentage: "89.99",
        sellerFeedbackScore: 0,
      },
    ] as Partial<Listing>[]

    // note cast from Partial<Listing> to Listing for testing purposes:
    const listingsIterable = arrayToAsyncIterable(
      listings,
    ) as AsyncIterable<Listing>
    const filtered = await chainAsync(listingsIterable)
      .filter((l) => sellerFeedbackFilter(l))
      .collect()
    expect(filtered).toHaveLength(2)
    const ids = filtered.map((item) => item.itemId)
    expect(ids).toContainEqual("v1|ccc|1")
    expect(ids).toContainEqual("v1|ddd|1")
  })

  it("should be included in compose", async () => {
    const listings = [
      {
        title: "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6",
        itemAffiliateWebUrl: "https://example.com",
        buyingOptions: ["FIXED_PRICE"],
        sellerFeedbackPercentage: "75.0",
      },
      {
        title: "PowerColor Fighter AMD Radeon RX 7800 XT 16GB GDDR6",
        itemAffiliateWebUrl: "https://example.com",
        buyingOptions: ["FIXED_PRICE"],
        sellerFeedbackPercentage: "99.9",
      },
    ]

    const gpu = await loadGpuFromYaml("amd-radeon-rx-7800-xt.yaml")
    const listingsIterable = arrayToAsyncIterable(
      listings,
    ) as AsyncIterable<Listing>

    createFilterForGpu(gpu)
    const filtered = await chainAsync(listingsIterable)
      .filter(createFilterForGpu(gpu))
      .collect()

    expect(filtered).toHaveLength(1)
    expect(filtered[0]).toHaveProperty("sellerFeedbackPercentage", "99.9")
  })
})
