"use client"
import {
  GpuMetricKey,
  GpuMetricKeys,
  GpuMetricsDescription,
} from "@/pkgs/isomorphic/model"
import { BootstrapIcon } from "./BootstrapIcon"
import { useState, type JSX } from "react"
import { createClientLogger } from "@/lib/clientLogger"

const log = createClientLogger("components:SortPanel")

interface SortValue {
  metricKey: GpuMetricKey
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
  // Group metrics by category
  const aiMetrics = GpuMetricKeys.filter(
    (key) => GpuMetricsDescription[key].category === "ai",
  )
  const gamingMetrics = GpuMetricKeys.filter(
    (key) => GpuMetricsDescription[key].category === "gaming",
  )

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
          defaultValue={value?.metricKey}
          onChange={(e) => {
            log.debug(`${e.target.id} changed: %o`, selectedOptions(e.target))
            const option = e.target.selectedOptions[0]
            onChange({
              ...value,
              metricKey: option.value as GpuMetricKey,
            })
          }}
        >
          <optgroup label="AI / ML Performance">
            {aiMetrics.map((metricKey) => (
              <option key={metricKey} value={metricKey}>
                {GpuMetricsDescription[metricKey].label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Gaming Performance">
            {gamingMetrics.map((metricKey) => (
              <option key={metricKey} value={metricKey}>
                {GpuMetricsDescription[metricKey].label}
              </option>
            ))}
          </optgroup>
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
