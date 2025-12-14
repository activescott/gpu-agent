"use client"

import type { JSX } from "react"
import type {
  CategoricalFilterConfig,
  FilterOption,
  FilterValue,
} from "./types"

interface CategoricalFilterProps {
  config: CategoricalFilterConfig
  currentValue: FilterValue | undefined
  onChange: (value: FilterValue | null) => void
}

/**
 * Categorical filter component with checkboxes
 * Supports multi-select with "only X" exclusive selection
 */
export function CategoricalFilter({
  config,
  currentValue,
  onChange,
}: CategoricalFilterProps): JSX.Element {
  const { options, displayName, name } = config

  // Get currently selected values (if no filter, all are shown/selected)
  const selectedValues = getSelectedValues(currentValue, options)
  const allSelected = selectedValues.length === options.length
  const noneSelected = selectedValues.length === 0

  // Handle checkbox toggle
  const handleToggle = (optionValue: string, isChecked: boolean): void => {
    // Add to selection or remove from selection
    const newSelected = isChecked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v) => v !== optionValue)

    // If all are selected or none are selected, clear the filter
    if (newSelected.length === options.length || newSelected.length === 0) {
      onChange(null)
    } else {
      onChange({
        operator: "in",
        value: newSelected,
      })
    }
  }

  // Handle "only X" exclusive selection
  const handleSelectOnly = (optionValue: string): void => {
    onChange({
      operator: "in",
      value: [optionValue],
    })
  }

  // Calculate active count for badge
  const activeCount = allSelected || noneSelected ? 0 : selectedValues.length

  return (
    <div className="filter-categorical">
      <div
        className="d-flex justify-content-between align-items-center mb-2"
        data-bs-toggle="collapse"
        data-bs-target={`#filter-collapse-${name}`}
        aria-expanded="false"
        aria-controls={`filter-collapse-${name}`}
        role="button"
        style={{ cursor: "pointer" }}
      >
        <span className="fw-semibold">{displayName}</span>
        {activeCount > 0 && (
          <span className="badge bg-secondary">
            {activeCount} of {options.length}
          </span>
        )}
      </div>

      <div className="collapse show" id={`filter-collapse-${name}`}>
        <div className="filter-options">
          {options.map((option) => (
            <FilterCheckbox
              key={option.value}
              option={option}
              isChecked={selectedValues.includes(option.value)}
              onToggle={handleToggle}
              onSelectOnly={handleSelectOnly}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface FilterCheckboxProps {
  option: FilterOption
  isChecked: boolean
  onToggle: (value: string, isChecked: boolean) => void
  onSelectOnly: (value: string) => void
}

function FilterCheckbox({
  option,
  isChecked,
  onToggle,
  onSelectOnly,
}: FilterCheckboxProps): JSX.Element {
  return (
    <div className="form-check d-flex align-items-center gap-2">
      <input
        className="form-check-input"
        type="checkbox"
        id={`filter-${option.value}`}
        checked={isChecked}
        onChange={(e) => onToggle(option.value, e.target.checked)}
      />
      <label
        className="form-check-label flex-grow-1"
        htmlFor={`filter-${option.value}`}
      >
        {option.label}
      </label>
      <button
        type="button"
        className="btn btn-link btn-sm text-muted p-0"
        onClick={() => onSelectOnly(option.value)}
        title={`Show only ${option.label}`}
      >
        only
      </button>
    </div>
  )
}

/**
 * Get the currently selected values from filter state
 * If no filter is active, returns all options (showing everything)
 */
function getSelectedValues(
  currentValue: FilterValue | undefined,
  options: FilterOption[],
): string[] {
  if (!currentValue) {
    // No filter = all selected
    return options.map((o) => o.value)
  }

  const { value } = currentValue
  if (Array.isArray(value)) {
    return value.map(String)
  }

  return [String(value)]
}
