import { applyFilters } from "./filterLogic"
import type { FilterState } from "./types"

/**
 * Tests for filter logic behavior.
 */
describe("applyFilters", () => {
  interface TestItem {
    name: string
    fps: number | null | undefined
    price: number
  }

  const getFieldValue = (item: TestItem, field: string): unknown => {
    return item[field as keyof TestItem]
  }

  const items: TestItem[] = [
    { name: "GPU A", fps: 100, price: 500 },
    { name: "GPU B", fps: 50, price: 300 },
    { name: "GPU C", fps: null, price: 400 },
    { name: "GPU D", fps: undefined, price: 200 },
  ]

  /**
   * Key design decision: Items with null/undefined values for a filtered field
   * are EXCLUDED from results. This ensures that when filtering by a benchmark
   * like FPS, GPUs without that benchmark data don't appear in results.
   */
  describe("empty values are excluded", () => {
    it("excludes items with null values when filter is active", () => {
      const filters: FilterState = {
        fps: { operator: "gte", value: 10 },
      }

      const result = applyFilters(items, filters, getFieldValue)

      // GPU C (null fps) should be excluded
      expect(result.map((i) => i.name)).not.toContain("GPU C")
      expect(result).toHaveLength(2) // Only A and B
    })

    it("excludes items with undefined values when filter is active", () => {
      const filters: FilterState = {
        fps: { operator: "gte", value: 10 },
      }

      const result = applyFilters(items, filters, getFieldValue)

      // GPU D (undefined fps) should be excluded
      expect(result.map((i) => i.name)).not.toContain("GPU D")
    })

    it("includes all items when no filters are active", () => {
      const filters: FilterState = {}

      const result = applyFilters(items, filters, getFieldValue)

      expect(result).toHaveLength(4)
    })
  })
})
