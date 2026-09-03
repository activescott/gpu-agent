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
  const { options, displayName, name, maxHeight } = config
  const isHasAll = config.selectionMode === "hasAll"

  // Get currently selected values. In "oneOf" mode, no filter = all shown/selected.
  // In "hasAll" mode, no filter = nothing required (none checked).
  const selectedValues = getSelectedValues(currentValue, options, isHasAll)
  const allSelected = selectedValues.length === options.length
  const noneSelected = selectedValues.length === 0

  // Handle checkbox toggle
  const handleToggle = (optionValue: string, isChecked: boolean): void => {
    // Add to selection or remove from selection
    const newSelected = isChecked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v) => v !== optionValue)

    if (isHasAll) {
      // Only clear when nothing is required; all-checked is a legitimate,
      // empty-result filter and must not be treated the same as "no filter."
      if (newSelected.length === 0) {
        onChange(null)
      } else {
        onChange({ operator: "hasAll", value: newSelected })
      }
      return
    }

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
      operator: isHasAll ? "hasAll" : "in",
      value: [optionValue],
    })
  }

  // Calculate active count for badge
  const activeCount = isHasAll
    ? selectedValues.length
    : allSelected || noneSelected
      ? 0
      : selectedValues.length

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
            {isHasAll ? `${activeCount} required` : `${activeCount} of ${options.length}`}
          </span>
        )}
      </div>

      <div className="collapse show" id={`filter-collapse-${name}`}>
        <div
          className="filter-options"
          style={
            maxHeight
              ? { maxHeight: `${maxHeight}px`, overflowY: "auto" }
              : undefined
          }
        >
          {options.map((option) => (
            <FilterCheckbox
              key={option.value}
              filterName={name}
              option={option}
              isChecked={selectedValues.includes(option.value)}
              onToggle={handleToggle}
              onSelectOnly={isHasAll ? undefined : handleSelectOnly}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface FilterCheckboxProps {
  filterName: string
  option: FilterOption
  isChecked: boolean
  onToggle: (value: string, isChecked: boolean) => void
  onSelectOnly?: (value: string) => void
}

function FilterCheckbox({
  filterName,
  option,
  isChecked,
  onToggle,
  onSelectOnly,
}: FilterCheckboxProps): JSX.Element {
  const checkboxId = `filter-${filterName}-${option.value}`
  return (
    <div className="form-check d-flex align-items-center gap-2">
      <input
        className="form-check-input"
        type="checkbox"
        id={checkboxId}
        checked={isChecked}
        onChange={(e) => onToggle(option.value, e.target.checked)}
        aria-label={option.label}
      />
      <label
        className="form-check-label flex-grow-1"
        htmlFor={checkboxId}
      >
        {option.label}
      </label>
      {onSelectOnly && (
        <button
          type="button"
          className="btn btn-link btn-sm text-muted p-0"
          onClick={() => onSelectOnly(option.value)}
          title={`Show only ${option.label}`}
        >
          only
        </button>
      )}
    </div>
  )
}

/**
 * Get the currently selected values from filter state.
 * "oneOf" mode: no filter = all options selected (showing everything).
 * "hasAll" mode: no filter = nothing selected (nothing required).
 */
function getSelectedValues(
  currentValue: FilterValue | undefined,
  options: FilterOption[],
  isHasAll: boolean,
): string[] {
  if (!currentValue) {
    return isHasAll ? [] : options.map((o) => o.value)
  }

  const { value } = currentValue
  if (Array.isArray(value)) {
    return value.map(String)
  }

  return [String(value)]
}
