import * as ListingRepository from "../../../pkgs/server/db/ListingRepository"
import {
  hoursToMilliseconds,
  secondsToMilliseconds,
} from "../../isomorphic/duration"
import { cacheEbayListingsForGpu } from "./ebay"
import { revalidateCachedListings } from "./listings"

jest.mock("../../../pkgs/server/db/ListingRepository")
jest.mock("./ebay", () => {
  const actual = jest.requireActual("./ebay")
  return {
    ...actual,
    cacheEbayListingsForGpu: jest.fn(async () => []),
  }
})

describe("fetchListingsForAllGPUsWithCache", () => {
  describe("cached listings are fresh", () => {
    it("should return cached listings if they are fresh", async () => {
      // mock ListingRepository with some fresh listings:
      const freshDate = new Date(Date.now() - secondsToMilliseconds(100))
      jest
        .mocked(ListingRepository.listCachedListingsGroupedByGpu)
        .mockImplementation(async () => {
          return [
            {
              gpuName: "test-gpu",
              listings: [
                {
                  cachedAt: freshDate,
                  gpu: {
                    name: "test-gpu-1",
                  },
                },
                {
                  cachedAt: freshDate,
                  gpu: {
                    name: "test-gpu-2",
                  },
                },
                // casting for mock:
              ] as unknown as ListingRepository.CachedListing[],
            },
          ]
        })

      // call
      const result = await revalidateCachedListings(secondsToMilliseconds(15))

      // validate that the two fresh listings were not re-cached
      expect(cacheEbayListingsForGpu).toHaveBeenCalledTimes(0)
      expect(result).toHaveProperty("listingCachedCount", 0)
    })
  })

  describe("cached listings are stale", () => {
    it("should fetch updated listings", async () => {
      // mock ListingRepository with some stale listings:
      const staleDate = new Date(Date.now() - hoursToMilliseconds(24))
      jest
        .mocked(ListingRepository.listCachedListingsGroupedByGpu)
        .mockImplementation(async () => {
          return [
            {
              gpuName: "test-gpu-x",
              listings: [
                {
                  cachedAt: staleDate,
                  gpu: {
                    name: "test-gpu-1",
                  },
                },
                {
                  cachedAt: staleDate,
                  gpu: {
                    name: "test-gpu-2",
                  },
                },
                // HACK casting since not all properties of CachedListing mocked above:
              ] as unknown as ListingRepository.CachedListing[],
            },
          ]
        })

      // return some listings that it cached so that it can count them:
      jest.mocked(cacheEbayListingsForGpu).mockImplementation(async () => {
        return [
          {
            cachedAt: new Date(),
            gpu: {
              name: "test-gpu-1",
            },
          },
          {
            cachedAt: new Date(),
            gpu: {
              name: "test-gpu-2",
            },
          },
          // HACK casting since not all properties of CachedListing mocked above:
        ] as unknown as ListingRepository.CachedListing[]
      })

      // call
      const result = await revalidateCachedListings(secondsToMilliseconds(15))

      // validate that it attempted to cache some listings:
      expect(cacheEbayListingsForGpu).toHaveBeenCalledTimes(1)

      // make sure it returned the listings:
      expect(result).toHaveProperty("listingCachedCount", 2)
      expect(result).toHaveProperty("staleGpus")
      // only one GPU type was stale (with 2 listings for it):
      expect(result.staleGpus).toHaveLength(1)
    })
  })
})
