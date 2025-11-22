import {
  mapSlugToMetric,
  metricToSlug,
  listRankingSlugs,
  listBenchmarkSlugs,
  rankingTitle,
  rankingDescription,
  rankingCanonicalPath,
  type RankingSlug,
} from "./slugs"

describe("slug mapping functions", () => {
  describe("mapSlugToMetric", () => {
    it("should map AI slugs to metric keys", () => {
      expect(mapSlugToMetric("fp32-flops" as RankingSlug, "ai")).toBe(
        "fp32TFLOPS",
      )
      expect(mapSlugToMetric("tensor-cores" as RankingSlug, "ai")).toBe(
        "tensorCoreCount",
      )
      expect(mapSlugToMetric("fp16-flops" as RankingSlug, "ai")).toBe(
        "fp16TFLOPS",
      )
      expect(mapSlugToMetric("int8-tops" as RankingSlug, "ai")).toBe("int8TOPS")
      expect(mapSlugToMetric("memory-gb" as RankingSlug, "ai")).toBe(
        "memoryCapacityGB",
      )
      expect(mapSlugToMetric("memory-bandwidth-gbs" as RankingSlug, "ai")).toBe(
        "memoryBandwidthGBs",
      )
    })

    it("should map gaming slugs to metric keys", () => {
      expect(
        mapSlugToMetric(
          "counter-strike-2-fps-3840x2160" as RankingSlug,
          "gaming",
        ),
      ).toBe("counterStrike2Fps3840x2160")
      expect(
        mapSlugToMetric(
          "counter-strike-2-fps-2560x1440" as RankingSlug,
          "gaming",
        ),
      ).toBe("counterStrike2Fps2560x1440")
      expect(
        mapSlugToMetric(
          "counter-strike-2-fps-1920x1080" as RankingSlug,
          "gaming",
        ),
      ).toBe("counterStrike2Fps1920x1080")
      expect(
        mapSlugToMetric("3dmark-wildlife-extreme-fps" as RankingSlug, "gaming"),
      ).toBe("3dmarkWildLifeExtremeFps")
    })

    it("should throw error for unknown slug", () => {
      expect(() =>
        mapSlugToMetric("invalid-slug" as RankingSlug, "ai"),
      ).toThrow("Unknown slug: invalid-slug for category ai")
    })

    it("should throw error for wrong category", () => {
      expect(() =>
        mapSlugToMetric("fp32-flops" as RankingSlug, "gaming"),
      ).toThrow("Unknown slug: fp32-flops for category gaming")
    })
  })

  describe("metricToSlug", () => {
    it("should reverse map AI metric keys to slugs", () => {
      expect(metricToSlug("fp32TFLOPS", "ai")).toBe("fp32-flops")
      expect(metricToSlug("tensorCoreCount", "ai")).toBe("tensor-cores")
      expect(metricToSlug("fp16TFLOPS", "ai")).toBe("fp16-flops")
      expect(metricToSlug("int8TOPS", "ai")).toBe("int8-tops")
      expect(metricToSlug("memoryCapacityGB", "ai")).toBe("memory-gb")
      expect(metricToSlug("memoryBandwidthGBs", "ai")).toBe(
        "memory-bandwidth-gbs",
      )
    })

    it("should reverse map gaming metric keys to slugs", () => {
      expect(metricToSlug("counterStrike2Fps3840x2160", "gaming")).toBe(
        "counter-strike-2-fps-3840x2160",
      )
      expect(metricToSlug("counterStrike2Fps2560x1440", "gaming")).toBe(
        "counter-strike-2-fps-2560x1440",
      )
      expect(metricToSlug("counterStrike2Fps1920x1080", "gaming")).toBe(
        "counter-strike-2-fps-1920x1080",
      )
      expect(metricToSlug("3dmarkWildLifeExtremeFps", "gaming")).toBe(
        "3dmark-wildlife-extreme-fps",
      )
    })

    it("should return undefined for unknown metric", () => {
      expect(metricToSlug("unknownMetric" as any, "ai")).toBeUndefined()
    })

    it("should return undefined for wrong category", () => {
      expect(metricToSlug("fp32TFLOPS", "gaming")).toBeUndefined()
      expect(metricToSlug("counterStrike2Fps3840x2160", "ai")).toBeUndefined()
    })
  })

  describe("round-trip conversion", () => {
    it("should maintain slug identity through round-trip for AI metrics", () => {
      const aiSlugs = listRankingSlugs("ai")
      for (const slug of aiSlugs) {
        const metric = mapSlugToMetric(slug, "ai")
        const backToSlug = metricToSlug(metric, "ai")
        expect(backToSlug).toBe(slug)
      }
    })

    it("should maintain slug identity through round-trip for gaming metrics", () => {
      const gamingSlugs = listRankingSlugs("gaming")
      for (const slug of gamingSlugs) {
        const metric = mapSlugToMetric(slug, "gaming")
        const backToSlug = metricToSlug(metric, "gaming")
        expect(backToSlug).toBe(slug)
      }
    })
  })

  describe("listRankingSlugs", () => {
    it("should return all AI slugs", () => {
      const slugs = listRankingSlugs("ai")
      expect(slugs).toContain("fp32-flops")
      expect(slugs).toContain("tensor-cores")
      expect(slugs).toContain("fp16-flops")
      expect(slugs).toContain("int8-tops")
      expect(slugs).toContain("memory-gb")
      expect(slugs).toContain("memory-bandwidth-gbs")
      expect(slugs).toHaveLength(6)
    })

    it("should return all gaming slugs", () => {
      const slugs = listRankingSlugs("gaming")
      expect(slugs).toContain("counter-strike-2-fps-3840x2160")
      expect(slugs).toContain("counter-strike-2-fps-2560x1440")
      expect(slugs).toContain("counter-strike-2-fps-1920x1080")
      expect(slugs).toContain("3dmark-wildlife-extreme-fps")
      expect(slugs).toHaveLength(4)
    })
  })

  describe("listBenchmarkSlugs", () => {
    it("should return gaming slugs", () => {
      const benchmarkSlugs = listBenchmarkSlugs()
      const gamingSlugs = listRankingSlugs("gaming")
      expect(benchmarkSlugs).toEqual(gamingSlugs)
    })
  })

  describe("rankingTitle", () => {
    it("should generate correct title for AI metrics", () => {
      const title = rankingTitle("fp32-flops" as RankingSlug, "ai")
      expect(title).toContain("FP32 TFLOPs")
      expect(title).toContain("$")
    })

    it("should generate correct title for gaming metrics", () => {
      const title = rankingTitle(
        "counter-strike-2-fps-3840x2160" as RankingSlug,
        "gaming",
      )
      expect(title).toContain("FPS")
      expect(title).toContain("$")
    })
  })

  describe("rankingDescription", () => {
    it("should generate correct description for AI metrics", () => {
      const desc = rankingDescription("fp32-flops" as RankingSlug, "ai")
      expect(desc).toContain("Best GPUs")
      expect(desc).toContain("cost-performance")
      expect(desc).toContain("FP32 TFLOPs")
    })

    it("should generate correct description for gaming metrics", () => {
      const desc = rankingDescription(
        "counter-strike-2-fps-3840x2160" as RankingSlug,
        "gaming",
      )
      expect(desc).toContain("Best GPUs")
      expect(desc).toContain("cost-performance")
    })
  })

  describe("rankingCanonicalPath", () => {
    it("should generate correct path for AI metrics", () => {
      const path = rankingCanonicalPath("fp32-flops" as RankingSlug, "ai")
      expect(path).toBe("/gpu/ranking/ai/fp32-flops")
    })

    it("should generate correct path for gaming metrics", () => {
      const path = rankingCanonicalPath(
        "counter-strike-2-fps-3840x2160" as RankingSlug,
        "gaming",
      )
      expect(path).toBe("/gpu/ranking/gaming/counter-strike-2-fps-3840x2160")
    })
  })
})
