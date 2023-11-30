import { convertEbayItemToListing } from "@/pkgs/isomorphic/model"
import { loadTestListingsFromJson } from "../listings"
import { addListingsForGpu, listListingsForGpu } from "./ListingRepository"

describe("addListingsForGpu", () => {
  it.skip("dev should add listings for a gpu", async () => {
    jest.setTimeout(10_000)

    const testListings = await loadTestListingsFromJson()
    const converted = testListings
      .slice(0, 25)
      .map((item) => convertEbayItemToListing(item))

    await addListingsForGpu(converted, "test-gpu")

    const returned = await listListingsForGpu("test-gpu", false)
    expect(returned).toHaveLength(converted.length)

    //expect(returned).toEqual(converted) // doesn't work because itemCreationDate is a date from the DB and a string in json and createdAt, updatedAt, and gpuName are added by DB/prisma
  })
})
