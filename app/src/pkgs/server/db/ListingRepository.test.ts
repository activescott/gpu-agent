import { convertEbayItemToListing } from "@/pkgs/isomorphic/model"
import { loadTestListingsFromJson } from "../listings"
import {
  addListingsForGpu,
  getAverageGpuPrice,
  listListingsForGpu,
  topNListingsByCostPerformance,
} from "./ListingRepository"

describe("addListingsForGpu", () => {
  it.skip("dev should add listings for a gpu", async () => {
    jest.setTimeout(10_000)

    const testListings = await loadTestListingsFromJson(TestGpu.name)
    const converted = testListings
      .slice(0, 25)
      .map((item) => convertEbayItemToListing(item, TestGpu))

    await addListingsForGpu(converted, "test-gpu")

    const returned = await listListingsForGpu("test-gpu", false)
    expect(returned).toHaveLength(converted.length)

    //expect(returned).toEqual(converted) // doesn't work because itemCreationDate is a date from the DB and a string in json and createdAt, updatedAt, and gpuName are added by DB/prisma
  })
})

const TestGpu = {
  name: "test-gpu",
  label: "Test GPU",
  tensorCoreCount: 1,
  fp32TFLOPS: 1.1,
  fp16TFLOPS: 1,
  int8TOPS: 1,
  memoryCapacityGB: 1,
  memoryBandwidthGBs: 1,
  summary: "Test GPU Summary",
  references: [],
}

describe("getAverageGpuPrice", () => {
  it.skip("should return a number", async () => {
    const result = await getAverageGpuPrice("nvidia-a100-pcie")
    expect(result.price).toStrictEqual(21_887.993_333_333_336)
    expect(result.activeListingCount).toStrictEqual(3)
  })
})

describe("topNListingsByCostPerformance", () => {
  it.skip("should return listings", async () => {
    const listings = await topNListingsByCostPerformance("fp32TFLOPS", 3)
    console.log("top n listings:", listings)
    expect(listings).toHaveLength(3)
  })
})
