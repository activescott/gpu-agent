"use client"
import {
  GpuSpecKeys,
  GpuSpecKey,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/specs"
import { createDiag } from "@activescott/diag"
import { BootstrapIcon } from "./BootstrapIcon"

const log = createDiag("shopping-agent:SortPanel")

export function useSortPanel(
  sortValue: SortValue,
  setSortValue: (value: SortValue) => void,
): { sortComponent: JSX.Element } {
  const sortPanel = (
    <div className="w-100">
      <div id="dialog-positioning-container" className="d-inline-block">
        <SortPanel
          value={sortValue}
          onChange={(value) => {
            log.debug("sort panel changed:", value)
            setSortValue(value)
          }}
        />
      </div>
    </div>
  )
  return { sortComponent: sortPanel }
}

interface SortValue {
  specKey: GpuSpecKey
  ascending: boolean
}

interface SortPanelProps {
  value: SortValue
  onChange: (value: SortValue) => void
}

const SortPanel = ({ value, onChange }: SortPanelProps) => {
  return (
    <div className=" border rounded py-2 px-3 d-flex">
      <label
        htmlFor="contact-spec"
        className="d-block form-label text-nowrap me-2"
      >
        Sort by
      </label>
      <select
        id="select-spec"
        className="form-select form-select-sm"
        defaultValue={value?.specKey}
        onChange={(e) => {
          log.debug(`${e.target.id} changed: %o`, selectedOptions(e.target))
          const first = e.target.selectedOptions[0]
          onChange({
            ...value,
            specKey: first.value as GpuSpecKey,
          })
        }}
      >
        {GpuSpecKeys.map((specKey) => (
          <option key={specKey} value={specKey}>
            {GpuSpecsDescription[specKey].label}
          </option>
        ))}
      </select>
      <div className="form-check form-check-inline">
        <input
          type="radio"
          className="btn-check"
          name="sortDirection"
          id="ascending"
          checked={value.ascending}
          onChange={() => {
            onChange({
              ...value,
              ascending: true,
            })
          }}
        />
        <label className="btn btn-sm btn-secondary" htmlFor="ascending">
          <BootstrapIcon icon="sort-up" size="xs" />
        </label>
      </div>
      <div className="form-check form-check-inline ps-0">
        <input
          type="radio"
          className="btn-check"
          name="sortDirection"
          id="descending"
          checked={!value.ascending}
          onChange={() => {
            onChange({
              ...value,
              ascending: false,
            })
          }}
        />
        <label className="btn btn-sm btn-secondary" htmlFor="descending">
          <BootstrapIcon icon="sort-down" size="xs" />
        </label>
      </div>
    </div>
  )
}

const selectedOptions = (el: HTMLSelectElement): string =>
  [...el.selectedOptions].map((o) => o.value).join(",")
