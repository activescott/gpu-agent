import { describe, it, expect } from "vitest"
import { applyFilters, getFilterSummary } from "./filterLogic"
import type { FilterState } from "./types"

describe("applyFilters", () => {
  const items = [
    { name: "Item A", price: 100, category: "Electronics" },
    { name: "Item B", price: 200, category: "Electronics" },
    { name: "Item C", price: 150, category: "Clothing" },
    { name: "Item D", price: 50, category: "Clothing" },
  ]

  const getFieldValue = (item: (typeof items)[0], field: string) => {
    return item[field as keyof typeof item]
  }

  it("returns all items when no filters", () => {
    const result = applyFilters(items, {}, getFieldValue)
    expect(result).toHaveLength(4)
  })

  it("filters with gte operator", () => {
    const filters: FilterState = {
      price: { operator: "gte", value: 150 },
    }
    const result = applyFilters(items, filters, getFieldValue)
    expect(result).toHaveLength(2)
    // Items B (200) and C (150) have price >= 150
    expect(result.map((i) => i.name)).toEqual(["Item B", "Item C"])
  })

  it("filters with lte operator", () => {
    const filters: FilterState = {
      price: { operator: "lte", value: 100 },
    }
    const result = applyFilters(items, filters, getFieldValue)
    expect(result).toHaveLength(2)
  })

  it("filters with in operator for categorical", () => {
    const filters: FilterState = {
      category: { operator: "in", value: ["Electronics"] },
    }
    const result = applyFilters(items, filters, getFieldValue)
    expect(result).toHaveLength(2)
  })

  it("combines multiple filters with AND logic", () => {
    const filters: FilterState = {
      price: { operator: "lte", value: 150 },
      category: { operator: "in", value: ["Electronics"] },
    }
    const result = applyFilters(items, filters, getFieldValue)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("Item A")
  })

  // this was a key design decision as it prevents seemingly unrelated items from showing up that the user explicitly does *not* want to see.
  it("excludes items with null/undefined values", () => {
    const itemsWithNull = [
      { name: "A", price: 100 },
      { name: "B", price: null },
    ]
    const filters: FilterState = {
      price: { operator: "gte", value: 50 },
    }
    const result = applyFilters(
      itemsWithNull,
      filters,
      (item, field) => item[field as keyof typeof item],
    )
    expect(result).toHaveLength(1)
  })
})

describe("getFilterSummary", () => {
  it("formats gte operator correctly", () => {
    const summary = getFilterSummary(
      { operator: "gte", value: 100 },
      "Price",
      "$",
    )
    expect(summary).toBe("Price >= 100 $")
  })

  it("formats lte operator correctly", () => {
    const summary = getFilterSummary(
      { operator: "lte", value: 500 },
      "Budget",
      "$",
    )
    expect(summary).toBe("Budget <= 500 $")
  })

  it("formats in operator with single value", () => {
    const summary = getFilterSummary(
      { operator: "in", value: ["New"] },
      "Condition",
    )
    expect(summary).toBe("Condition: New")
  })

  it("formats in operator with multiple values", () => {
    const summary = getFilterSummary(
      { operator: "in", value: ["New", "Used"] },
      "Condition",
    )
    expect(summary).toBe("Condition: 2 selected")
  })
})
