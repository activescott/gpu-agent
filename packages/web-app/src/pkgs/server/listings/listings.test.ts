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
jest.mock("../db/db", () => ({
  ...jest.requireActual("../db/db"),
  withTransaction: jest.fn((fn) => fn({})),
}))

describe("fetchListingsForAllGPUsWithCache", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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
      expect(result).toHaveProperty("staleGpusAtStart")
      // only one GPU type was stale (with 2 listings for it):
      expect(result.staleGpusAtStart).toHaveLength(1)
    })
  })

  describe("staleness queue fairness (issue #48)", () => {
    it("does not starve other stale GPUs when one always returns 0 listings", async () => {
      // Deterministic PRNG so the test isn't flaky.
      let seed = 1
      const randomSpy = jest.spyOn(Math, "random").mockImplementation(() => {
        seed = (seed * 1_664_525 + 1_013_904_223) >>> 0
        return seed / 0x1_00_00_00_00
      })

      try {
        const staleDate = new Date(Date.now() - hoursToMilliseconds(24))
        const gpuCount = 20
        const gpuNames = Array.from(
          { length: gpuCount },
          (_, i) => `test-gpu-${i}`,
        )
        const zeroResultGpu = gpuNames[0]

        jest
          .mocked(ListingRepository.listCachedListingsGroupedByGpu)
          .mockImplementation(async () => {
            return gpuNames.map((name) => ({
              gpuName: name,
              listings: [
                {
                  cachedAt: staleDate,
                  gpu: { name },
                },
              ] as unknown as ListingRepository.CachedListing[],
            }))
          })

        jest
          .mocked(cacheEbayListingsForGpu)
          .mockImplementation(async (gpuName) => {
            if (gpuName === zeroResultGpu) {
              // Always returns 0 → stays stale every run (the prod bug).
              return []
            }
            return [
              {
                cachedAt: new Date(),
                gpu: { name: gpuName },
              },
            ] as unknown as ListingRepository.CachedListing[]
          })

        const runs = 50
        for (let i = 0; i < runs; i++) {
          await revalidateCachedListings(secondsToMilliseconds(15))
        }

        const callsByGpu = jest
          .mocked(cacheEbayListingsForGpu)
          .mock.calls.map((call) => call[0])
        const uniqueGpus = new Set(callsByGpu)

        // Every GPU — including the always-zero one and the never-listed ones —
        // should have been processed at least once across the runs.
        for (const name of gpuNames) {
          expect(uniqueGpus.has(name)).toBe(true)
        }

        // And no GPU should monopolize. Before the fix, the zero-result GPU
        // was picked in 13/14 prod cycles. With shuffle + 4-of-20 slots per
        // run, expected picks per GPU = 50 * 4 / 20 = 10. Assert the zero-
        // result GPU is picked far less than every run.
        const zeroResultCalls = callsByGpu.filter(
          (name) => name === zeroResultGpu,
        ).length
        expect(zeroResultCalls).toBeLessThan(runs / 2)
      } finally {
        randomSpy.mockRestore()
      }
    })
  })
})
