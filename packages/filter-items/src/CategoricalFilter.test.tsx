import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import { afterEach } from "vitest"
import { CategoricalFilter } from "./CategoricalFilter"
import type { CategoricalFilterConfig, FilterValue } from "./types"

afterEach(cleanup)

const oneOfConfig: CategoricalFilterConfig = {
  type: "categorical",
  name: "condition",
  displayName: "Condition",
  options: [
    { value: "New", label: "New" },
    { value: "Used", label: "Used" },
  ],
}

const hasAllConfig: CategoricalFilterConfig = {
  type: "categorical",
  name: "precision",
  displayName: "Precision Support",
  selectionMode: "hasAll",
  options: [
    { value: "FP8", label: "FP8" },
    { value: "FP4", label: "FP4" },
  ],
}

function getCheckbox(name: string, optionValue: string): HTMLInputElement {
  return document.getElementById(
    `filter-${name}-${optionValue}`,
  ) as HTMLInputElement
}

describe("CategoricalFilter", () => {
  it("hasAll mode with undefined value renders zero checked", () => {
    render(
      <CategoricalFilter
        config={hasAllConfig}
        currentValue={undefined}
        onChange={vi.fn()}
      />,
    )
    expect(getCheckbox("precision", "FP8").checked).toBe(false)
    expect(getCheckbox("precision", "FP4").checked).toBe(false)
  })

  it("oneOf mode with undefined value renders all checked (regression guard)", () => {
    render(
      <CategoricalFilter
        config={oneOfConfig}
        currentValue={undefined}
        onChange={vi.fn()}
      />,
    )
    expect(getCheckbox("condition", "New").checked).toBe(true)
    expect(getCheckbox("condition", "Used").checked).toBe(true)
  })

  it("hasAll mode toggle emits hasAll operator", () => {
    const onChange = vi.fn()
    render(
      <CategoricalFilter
        config={hasAllConfig}
        currentValue={undefined}
        onChange={onChange}
      />,
    )
    fireEvent.click(getCheckbox("precision", "FP8"))
    expect(onChange).toHaveBeenCalledWith({
      operator: "hasAll",
      value: ["FP8"],
    })
  })

  it("hasAll mode last uncheck emits null", () => {
    const onChange = vi.fn()
    const currentValue: FilterValue = { operator: "hasAll", value: ["FP8"] }
    render(
      <CategoricalFilter
        config={hasAllConfig}
        currentValue={currentValue}
        onChange={onChange}
      />,
    )
    fireEvent.click(getCheckbox("precision", "FP8"))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it("hasAll mode all-checked does not emit null", () => {
    const onChange = vi.fn()
    const currentValue: FilterValue = { operator: "hasAll", value: ["FP8"] }
    render(
      <CategoricalFilter
        config={hasAllConfig}
        currentValue={currentValue}
        onChange={onChange}
      />,
    )
    fireEvent.click(getCheckbox("precision", "FP4"))
    expect(onChange).toHaveBeenCalledWith({
      operator: "hasAll",
      value: ["FP8", "FP4"],
    })
  })

  it("hasAll mode hides the only button", () => {
    render(
      <CategoricalFilter
        config={hasAllConfig}
        currentValue={undefined}
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByText("only")).toBeNull()
  })

  it("checkbox ids are namespaced by filter name", () => {
    render(
      <CategoricalFilter
        config={oneOfConfig}
        currentValue={undefined}
        onChange={vi.fn()}
      />,
    )
    expect(document.getElementById("filter-condition-New")).not.toBeNull()
  })

  it("checkbox has an aria-label independent of label[for] association", () => {
    // FilterLayout renders the filter panel twice (desktop sidebar + mobile
    // offcanvas), giving every checkbox id a duplicate elsewhere in the
    // document. label[for] resolves ambiguously across duplicate ids, so the
    // accessible name must not depend on it.
    render(
      <CategoricalFilter
        config={oneOfConfig}
        currentValue={undefined}
        onChange={vi.fn()}
      />,
    )
    expect(getCheckbox("condition", "New").getAttribute("aria-label")).toBe(
      "New",
    )
  })
})
