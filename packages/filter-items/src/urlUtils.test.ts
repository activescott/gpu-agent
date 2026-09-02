import { describe, it, expect } from "vitest"
import {
  parseFiltersFromURL,
  serializeFiltersToURL,
  mergeFilterState,
  countActiveFilters,
} from "./urlUtils"

describe("parseFiltersFromURL", () => {
  it("parses numeric gte filter", () => {
    const params = new URLSearchParams("filter.price[gte]=100")
    const result = parseFiltersFromURL(params)
    expect(result.price).toEqual({ operator: "gte", value: 100 })
  })

  it("parses categorical in filter", () => {
    const params = new URLSearchParams("filter.category[in]=New,Used")
    const result = parseFiltersFromURL(params)
    expect(result.category).toEqual({
      operator: "in",
      value: ["New", "Used"],
    })
  })

  it("parses multiple filters", () => {
    const params = new URLSearchParams(
      "filter.price[lte]=500&filter.memory[gte]=8",
    )
    const result = parseFiltersFromURL(params)
    expect(result.price).toEqual({ operator: "lte", value: 500 })
    expect(result.memory).toEqual({ operator: "gte", value: 8 })
  })

  it("ignores invalid operators", () => {
    const params = new URLSearchParams("filter.price[invalid]=100")
    const result = parseFiltersFromURL(params)
    expect(result.price).toBeUndefined()
  })

  it("parses hasAll filter as comma-separated values", () => {
    const params = new URLSearchParams("filter.precision[hasAll]=FP8,FP4")
    const result = parseFiltersFromURL(params)
    expect(result.precision).toEqual({
      operator: "hasAll",
      value: ["FP8", "FP4"],
    })
  })

  it("trims whitespace in hasAll values", () => {
    const params = new URLSearchParams("filter.precision[hasAll]=FP8, FP4")
    const result = parseFiltersFromURL(params)
    expect(result.precision).toEqual({
      operator: "hasAll",
      value: ["FP8", "FP4"],
    })
  })
})

describe("serializeFiltersToURL", () => {
  it("serializes numeric filter", () => {
    const params = serializeFiltersToURL({
      price: { operator: "gte", value: 100 },
    })
    expect(params.get("filter.price[gte]")).toBe("100")
  })

  it("serializes categorical filter", () => {
    const params = serializeFiltersToURL({
      category: { operator: "in", value: ["New", "Used"] },
    })
    expect(params.get("filter.category[in]")).toBe("New,Used")
  })

  it("serializes hasAll filter", () => {
    const params = serializeFiltersToURL({
      precision: { operator: "hasAll", value: ["FP8", "FP4"] },
    })
    expect(params.get("filter.precision[hasAll]")).toBe("FP8,FP4")
  })

  it("round-trips hasAll filter through parse and serialize", () => {
    const original = new URLSearchParams(
      "filter.precision[hasAll]=FP8,FP4",
    )
    const parsed = parseFiltersFromURL(original)
    const serialized = serializeFiltersToURL(parsed)
    expect(serialized.get("filter.precision[hasAll]")).toBe("FP8,FP4")
  })
})

describe("mergeFilterState", () => {
  it("adds new filter", () => {
    const result = mergeFilterState({}, "price", { operator: "gte", value: 100 })
    expect(result.price).toEqual({ operator: "gte", value: 100 })
  })

  it("removes filter when value is null", () => {
    const result = mergeFilterState(
      { price: { operator: "gte", value: 100 } },
      "price",
      null,
    )
    expect(result.price).toBeUndefined()
  })

  it("preserves other filters", () => {
    const result = mergeFilterState(
      { price: { operator: "gte", value: 100 } },
      "memory",
      { operator: "gte", value: 8 },
    )
    expect(result.price).toEqual({ operator: "gte", value: 100 })
    expect(result.memory).toEqual({ operator: "gte", value: 8 })
  })
})

describe("countActiveFilters", () => {
  it("returns 0 for empty state", () => {
    expect(countActiveFilters({})).toBe(0)
  })

  it("counts active filters", () => {
    expect(
      countActiveFilters({
        price: { operator: "gte", value: 100 },
        memory: { operator: "gte", value: 8 },
      }),
    ).toBe(2)
  })
})
