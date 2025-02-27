import {
  getLatestListingDate,
  getPriceStats,
  topNListingsByCostPerformance,
} from "./ListingRepository"

describe("getPriceStats", () => {
  it.skip("should return a number", async () => {
    const result = await getPriceStats("nvidia-a100-pcie")
    console.log("result:", result)
    const props = ["avgPrice", "minPrice", "activeListingCount"]
    for (const prop of props) {
      expect(result).toHaveProperty(prop)
    }
    expect(result.avgPrice).toBeGreaterThan(0)
    expect(result.minPrice).toBeGreaterThan(0)
    expect(result.activeListingCount).toBeGreaterThan(0)
    expect(result.latestListingDate).toBeInstanceOf(Date)
  })
})

describe("topNListingsByCostPerformance", () => {
  it.skip("should return listings", async () => {
    const listings = await topNListingsByCostPerformance("fp32TFLOPS", 3)
    console.log("top n listings:", listings)
    expect(listings).toHaveLength(3)
  })
})

describe("getLatestListingDate", () => {
  it.skip("should return latest listing date", async () => {
    const result = await getLatestListingDate()
    console.log("latest listing date:", result)
    expect(result).toBeInstanceOf(Date)
  })
})
