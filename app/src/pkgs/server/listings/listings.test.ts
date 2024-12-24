import * as ListingRepository from "../../../pkgs/server/db/ListingRepository"
import {
  hoursToMilliseconds,
  secondsToMilliseconds,
} from "../../isomorphic/duration"
import { cacheEbayListingsForGpu } from "./ebay"
import { fetchListingsForAllGPUsWithCache } from "./listings"

jest.mock("../../../pkgs/server/db/ListingRepository")
jest.mock("./ebay", () => {
  const actual = jest.requireActual("./ebay")
  return {
    ...actual,
    cacheEbayListingsForGpu: jest.fn(async () => []),
  }
})

describe("fetchListingsForAllGPUsWithCache", () => {
  beforeEach(() => {})

  describe("cached listings are fresh", () => {
    it("should return cached listings if they are fresh", async () => {
      // mock ListingRepository with some fresh listings:
      const freshDate = new Date(Date.now() - secondsToMilliseconds(100))
      jest
        .mocked(ListingRepository.listListingsForAllGpus)
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
      jest
        .mocked(ListingRepository.listListingsAll)
        .mockImplementationOnce(async () => {
          return [
            {
              cachedAt: freshDate,
              gpu: {
                name: "test-gpu-1-cached",
              },
            },
            {
              cachedAt: freshDate,
              gpu: {
                name: "test-gpu-2-cached",
              },
            },
            // casting for mock:
          ] as unknown as ListingRepository.CachedListing[]
        })

      // call
      const listingsIterable = await fetchListingsForAllGPUsWithCache(
        secondsToMilliseconds(15),
      )
      const listings = [...listingsIterable]

      // validate that the two fresh listings were returned
      expect(ListingRepository.listListingsAll).toHaveBeenCalledTimes(1)

      expect(listings).toHaveLength(2)
      expect(listings[0].gpu).toHaveProperty("name", "test-gpu-1-cached")
      expect(listings[1].gpu).toHaveProperty("name", "test-gpu-2-cached")
    })
  })

  describe("cached listings are stale", () => {
    it("should fetch updated listings", async () => {
      // mock ListingRepository with some stale listings:
      const staleDate = new Date(Date.now() - hoursToMilliseconds(24))
      jest
        .mocked(ListingRepository.listListingsForAllGpus)
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
                // HACK casting since not all properties mocked above:
              ] as unknown as ListingRepository.CachedListing[],
            },
          ]
        })

      jest
        .mocked(ListingRepository.listListingsAll)
        .mockImplementation(async () => {
          return [
            {
              cachedAt: staleDate,
              gpu: {
                name: "test-gpu-1-listListingsAll",
              },
            },
            // casting for mock:
          ] as unknown as ListingRepository.CachedListing[]
        })

      // call
      const result = await fetchListingsForAllGPUsWithCache(
        secondsToMilliseconds(15),
      )

      // validate that it attempted to cache some listings:
      expect(cacheEbayListingsForGpu).toHaveBeenCalledTimes(1)
      expect(result).toHaveLength(1)
    })
  })
})
