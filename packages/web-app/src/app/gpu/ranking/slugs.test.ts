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

    it("should throw error for gaming slugs (deprecated - use database)", () => {
      expect(() =>
        mapSlugToMetric(
          "counter-strike-2-fps-3840x2160" as RankingSlug,
          "gaming",
        ),
      ).toThrow("Gaming slugs should use database-driven resolution")
    })

    it("should throw error for unknown slug", () => {
      expect(() =>
        mapSlugToMetric("invalid-slug" as RankingSlug, "ai"),
      ).toThrow("Unknown slug: invalid-slug for category ai")
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

    it("should return undefined for gaming metrics (deprecated - use database)", () => {
      expect(metricToSlug("fp32TFLOPS", "gaming")).toBeUndefined()
    })

    it("should return undefined for unknown metric", () => {
      expect(metricToSlug("unknownMetric" as any, "ai")).toBeUndefined()
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

    it("should return empty for gaming (use database)", () => {
      const slugs = listRankingSlugs("gaming")
      expect(slugs).toHaveLength(0)
    })
  })

  describe("listBenchmarkSlugs", () => {
    it("should return empty (deprecated - use database)", () => {
      const benchmarkSlugs = listBenchmarkSlugs()
      expect(benchmarkSlugs).toHaveLength(0)
    })
  })

  describe("rankingTitle", () => {
    it("should generate correct title for AI metrics", () => {
      const title = rankingTitle("fp32-flops" as RankingSlug, "ai")
      expect(title).toContain("FP32 TFLOPs")
      expect(title).toContain("$")
    })

    it("should generate generic title for gaming metrics", () => {
      const title = rankingTitle(
        "counter-strike-2-fps-3840x2160" as RankingSlug,
        "gaming",
      )
      expect(title).toContain("Performance")
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

    it("should generate generic description for gaming metrics", () => {
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
