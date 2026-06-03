import { sortGpusByField } from "./GpuMetricsTable"
import type { PricedGpu } from "@/pkgs/server/db/GpuRepository"

function makeGpu(
  name: string,
  opts: {
    activeListingCount: number
    minPrice: number
    percentile?: number
    metricValue?: number
  },
): PricedGpu {
  return {
    gpu: {
      name,
      label: name,
    } as PricedGpu["gpu"],
    price: {
      avgPrice: opts.minPrice,
      minPrice: opts.minPrice,
      maxPrice: opts.minPrice,
      activeListingCount: opts.activeListingCount,
      latestListingDate: new Date(),
      representativeImageUrl: null,
    },
    percentile: opts.percentile,
    metricValue: opts.metricValue,
  }
}

describe("sortGpusByField", () => {
  describe("sorting by percentile (Raw Performance Ranking)", () => {
    it("should rank GPUs by percentile regardless of whether they have listings", () => {
      // A high-performing GPU with no listings should still rank above
      // a lower-performing GPU that has listings, when sorting by raw performance.
      const highPerfNoListings = makeGpu("high-no-listings", {
        activeListingCount: 0,
        minPrice: 0,
        percentile: 0.95,
        metricValue: 1000,
      })
      const lowPerfWithListings = makeGpu("low-with-listings", {
        activeListingCount: 5,
        minPrice: 500,
        percentile: 0.2,
        metricValue: 100,
      })

      const sorted = sortGpusByField(
        [lowPerfWithListings, highPerfNoListings],
        "percentile",
        "desc",
      )

      expect(sorted.map((g) => g.gpu.name)).toEqual([
        "high-no-listings",
        "low-with-listings",
      ])
    })

    it("should not push no-listing GPUs to the bottom when sorting by percentile", () => {
      const gpus = [
        makeGpu("a", {
          activeListingCount: 0,
          minPrice: 0,
          percentile: 0.9,
          metricValue: 900,
        }),
        makeGpu("b", {
          activeListingCount: 3,
          minPrice: 400,
          percentile: 0.5,
          metricValue: 500,
        }),
        makeGpu("c", {
          activeListingCount: 0,
          minPrice: 0,
          percentile: 0.7,
          metricValue: 700,
        }),
        makeGpu("d", {
          activeListingCount: 2,
          minPrice: 200,
          percentile: 0.3,
          metricValue: 300,
        }),
      ]

      const sorted = sortGpusByField(gpus, "percentile", "desc")

      expect(sorted.map((g) => g.gpu.name)).toEqual(["a", "c", "b", "d"])
    })
  })

  describe("sorting by price (requires listings)", () => {
    it("should push no-listing GPUs to the bottom when sorting by price ascending", () => {
      const withListings = makeGpu("with", {
        activeListingCount: 5,
        minPrice: 500,
        percentile: 0.5,
        metricValue: 500,
      })
      const noListings = makeGpu("without", {
        activeListingCount: 0,
        minPrice: 0,
        percentile: 0.9,
        metricValue: 900,
      })

      const sorted = sortGpusByField([noListings, withListings], "price", "asc")

      expect(sorted.map((g) => g.gpu.name)).toEqual(["with", "without"])
    })
  })

  describe("sorting by dollarsPer (requires listings)", () => {
    it("should push no-listing GPUs to the bottom when sorting by $/metric", () => {
      const withListings = makeGpu("with", {
        activeListingCount: 5,
        minPrice: 500,
        percentile: 0.5,
        metricValue: 500,
      })
      const noListings = makeGpu("without", {
        activeListingCount: 0,
        minPrice: 0,
        percentile: 0.9,
        metricValue: 900,
      })

      const sorted = sortGpusByField(
        [noListings, withListings],
        "dollarsPer",
        "asc",
      )

      expect(sorted.map((g) => g.gpu.name)).toEqual(["with", "without"])
    })
  })

  describe("sorting by name", () => {
    it("should sort alphabetically regardless of listings", () => {
      const sorted = sortGpusByField(
        [
          makeGpu("zeta", {
            activeListingCount: 5,
            minPrice: 100,
            percentile: 0.1,
            metricValue: 100,
          }),
          makeGpu("alpha", {
            activeListingCount: 0,
            minPrice: 0,
            percentile: 0.9,
            metricValue: 900,
          }),
        ],
        "name",
        "asc",
      )

      expect(sorted.map((g) => g.gpu.name)).toEqual(["alpha", "zeta"])
    })
  })
})
