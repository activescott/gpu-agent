"use client"

import type { JSX, ChangeEvent } from "react"
import type { FilterValue, NumericFilterConfig } from "./types"

type NumericOperator = "gte" | "lte" | "range"

const MIDPOINT_DIVISOR = 2

interface NumericFilterProps {
  config: NumericFilterConfig
  currentValue: FilterValue | undefined
  onChange: (value: FilterValue | null) => void
}

/**
 * Numeric filter component with range slider
 * Supports operators: at least (gte), at most (lte)
 *
 * This is a fully controlled component - all state is derived from props.
 * The onChange callback is called immediately on user interaction.
 */
export function NumericFilter({
  config,
  currentValue,
  onChange,
}: NumericFilterProps): JSX.Element {
  const {
    displayName,
    name,
    min,
    max,
    step,
    unit,
    defaultOperator = "gte",
  } = config

  // Derive values from props (fully controlled)
  const operator = getOperator(currentValue, defaultOperator)
  const sliderValue = getSliderValue(currentValue, operator, min, max)

  // Check if filter is actively filtering (not at boundary)
  const isAtBoundary =
    (operator === "gte" && sliderValue <= min) ||
    (operator === "lte" && sliderValue >= max)
  const isActive = currentValue !== undefined && !isAtBoundary

  const handleOperatorChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const newOperator = e.target.value as NumericOperator
    // Set filter with new operator at boundary value
    // At boundary, items won't be filtered but operator selection is preserved
    const boundaryValue = newOperator === "lte" ? max : min
    onChange({ operator: newOperator, value: boundaryValue })
  }

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = Number(e.target.value)

    // Check if filter should be cleared (values at boundaries)
    const atMinBoundary = newValue <= min
    const atMaxBoundary = newValue >= max

    if (operator === "gte") {
      if (atMinBoundary) {
        onChange(null)
      } else {
        onChange({ operator: "gte", value: newValue })
      }
    } else if (operator === "lte") {
      if (atMaxBoundary) {
        onChange(null)
      } else {
        onChange({ operator: "lte", value: newValue })
      }
    }
  }

  // Format value for display
  const formatValue = (val: number): string => {
    if (unit === "$") {
      return `$${val}`
    }
    return unit ? `${val} ${unit}` : String(val)
  }

  // Get display text for current filter state
  const getDisplayText = (): string => {
    if (!isActive) {
      return operator === "lte"
        ? `≤ ${formatValue(max)}`
        : `≥ ${formatValue(min)}`
    }
    if (operator === "lte") {
      return `≤ ${formatValue(sliderValue)}`
    }
    return `≥ ${formatValue(sliderValue)}`
  }

  return (
    <div className="filter-numeric">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold">{displayName}</span>
        {isActive && <span className="badge bg-secondary">Active</span>}
      </div>

      {/* Operator selector */}
      <div className="mb-2">
        <select
          className="form-select form-select-sm"
          value={operator}
          onChange={handleOperatorChange}
          aria-label={`Filter type for ${displayName}`}
        >
          <option value="gte">At least</option>
          <option value="lte">At most</option>
        </select>
      </div>

      {/* Range slider */}
      <div className="mb-1">
        <input
          type="range"
          className="form-range"
          id={`filter-slider-${name}`}
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleSliderChange}
          aria-label={`${displayName} slider`}
        />
      </div>

      {/* Tick marks: min, center, max */}
      <div
        className="d-flex justify-content-between text-muted"
        style={{ fontSize: "0.7rem", marginTop: "-0.25rem" }}
      >
        <span>{formatValue(min)}</span>
        <span>{formatValue(Math.round((min + max) / MIDPOINT_DIVISOR))}</span>
        <span>{formatValue(max)}</span>
      </div>

      {/* Current value display */}
      <div className="text-center mt-1">
        <span className="fw-semibold">{getDisplayText()}</span>
      </div>
    </div>
  )
}

/**
 * Get operator from current filter value or use default
 */
function getOperator(
  currentValue: FilterValue | undefined,
  defaultOperator: NumericOperator,
): NumericOperator {
  if (!currentValue) return defaultOperator
  const { operator } = currentValue
  if (operator === "gte" || operator === "lte" || operator === "range") {
    return operator
  }
  return defaultOperator
}

/**
 * Get slider value from current filter value or default based on operator
 */
function getSliderValue(
  currentValue: FilterValue | undefined,
  operator: NumericOperator,
  min: number,
  max: number,
): number {
  if (!currentValue) {
    // Default position based on operator
    return operator === "lte" ? max : min
  }
  const { value } = currentValue
  if (typeof value === "number") {
    return value
  }
  return operator === "lte" ? max : min
}
