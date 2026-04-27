import { useState, useRef, useEffect, type JSX, type ChangeEvent, type KeyboardEvent } from "react"
import type { FilterValue, NumericFilterConfig } from "./types"

type NumericOperator = "gte" | "lte" | "range"

const MIDPOINT_DIVISOR = 2

interface NumericFilterProps {
  config: NumericFilterConfig
  currentValue: FilterValue | undefined
  onChange: (value: FilterValue | null) => void
  onTrack?: (interactionType: string, value: number) => void
}

/**
 * Numeric filter component with range slider, preset buttons, and click-to-edit input.
 * Supports operators: at least (gte), at most (lte).
 *
 * This is a fully controlled component - all state is derived from props.
 * The onChange callback is called immediately on user interaction.
 */
export function NumericFilter({
  config,
  currentValue,
  onChange,
  onTrack,
}: NumericFilterProps): JSX.Element {
  const {
    displayName,
    name,
    min,
    max,
    step,
    unit,
    defaultOperator = "gte",
    lockOperator,
    presets,
  } = config

  // Derive values from props (fully controlled)
  const operator = getOperator(currentValue, defaultOperator)
  const sliderValue = getSliderValue(currentValue, operator, min, max)

  // Check if filter is actively filtering (not at boundary)
  const isAtBoundary =
    (operator === "gte" && sliderValue <= min) ||
    (operator === "lte" && sliderValue >= max)
  const isActive = currentValue !== undefined && !isAtBoundary

  // Click-to-edit state
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleOperatorChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const newOperator = e.target.value as NumericOperator
    const boundaryValue = newOperator === "lte" ? max : min
    onChange({ operator: newOperator, value: boundaryValue })
  }

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = Number(e.target.value)
    applyValue(newValue)
    onTrack?.("slider_drag", newValue)
  }

  const handlePresetClick = (presetValue: number): void => {
    applyValue(presetValue)
    onTrack?.("preset_click", presetValue)
  }

  const handleEditStart = (): void => {
    setInputValue(isActive ? String(sliderValue) : "")
    setIsEditing(true)
  }

  const handleEditCommit = (): void => {
    setIsEditing(false)
    const raw = Number(inputValue)
    if (Number.isNaN(raw) || inputValue.trim() === "") return
    const snapped = Math.round(raw / step) * step
    const clamped = Math.max(min, Math.min(max, snapped))
    applyValue(clamped)
    onTrack?.("text_input", clamped)
  }

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleEditCommit()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  const formatValue = (val: number): string => {
    if (unit === "$") {
      return `$${val.toLocaleString()}`
    }
    return unit ? `${val.toLocaleString()} ${unit}` : String(val)
  }

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

  const visiblePresets = presets?.filter((p) => p >= min && p <= max)

  return (
    <div className="filter-numeric">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold">{displayName}</span>
        {isActive && <span className="badge bg-secondary">Active</span>}
      </div>

      {/* Operator selector (hidden when locked) */}
      {!lockOperator && (
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
      )}

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

      {/* Preset quick-select buttons */}
      {visiblePresets && visiblePresets.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-2">
          {visiblePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`btn btn-sm ${sliderValue === preset && isActive ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => handlePresetClick(preset)}
              style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem" }}
            >
              {formatValue(preset)}
            </button>
          ))}
        </div>
      )}

      {/* Current value — always looks like an input field */}
      <div className="mt-2">
        <div className="input-group input-group-sm">
          <span className="input-group-text" style={{ fontSize: "0.8rem" }}>
            {operator === "lte" ? "≤" : "≥"}{unit === "$" ? " $" : ""}
          </span>
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              className="form-control"
              min={min}
              max={max}
              step={step}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleEditCommit}
              onKeyDown={handleEditKeyDown}
              aria-label={`Enter ${displayName} value`}
            />
          ) : (
            <button
              type="button"
              className="form-control text-start"
              onClick={handleEditStart}
              aria-label={`Click to enter ${displayName} value`}
              style={{ cursor: "text" }}
            >
              {isActive ? sliderValue.toLocaleString() : (operator === "lte" ? max.toLocaleString() : min.toLocaleString())}
            </button>
          )}
          {unit && unit !== "$" && (
            <span className="input-group-text" style={{ fontSize: "0.8rem" }}>
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  function applyValue(newValue: number): void {
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
    return operator === "lte" ? max : min
  }
  const { value } = currentValue
  if (typeof value === "number") {
    return value
  }
  return operator === "lte" ? max : min
}
