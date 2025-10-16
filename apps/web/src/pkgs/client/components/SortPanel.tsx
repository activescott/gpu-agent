"use client"
import {
  GpuSpecKeys,
  GpuSpecKey,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import { createDiag } from "@activescott/diag"
import { BootstrapIcon } from "./BootstrapIcon"
import { useState, type JSX } from "react"

const log = createDiag("shopping-agent:SortPanel")

interface SortValue {
  specKey: GpuSpecKey
  ascending: boolean
}

interface SortPanelProps {
  value: SortValue
  onChange: (value: SortValue) => void
}

export function useSorting(
  initialSortValue: SortValue,
  onChange: (value: SortValue) => void,
): { sortPanel: JSX.Element; sortValue: SortValue } {
  const [sortValue, setSortValue] = useState<SortValue>(initialSortValue)

  const sortPanel = (
    <SortPanel
      value={sortValue}
      onChange={(newValue: SortValue) => {
        log.debug("Sorting listings...")
        setSortValue(newValue)
        onChange(newValue)
      }}
    />
  )

  return { sortPanel, sortValue }
}

const SortPanel = ({ value, onChange }: SortPanelProps) => {
  return (
    <div className="w-100">
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
            const option = e.target.selectedOptions[0]
            onChange({
              ...value,
              specKey: option.value as GpuSpecKey,
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
    </div>
  )
}

const selectedOptions = (el: HTMLSelectElement): string =>
  [...el.selectedOptions].map((o) => o.value).join(",")
