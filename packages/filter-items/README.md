# @activescott/filter-items

Generic React filter components with URL sync support. Provides numeric and categorical filters with Bootstrap styling.

## Installation

```bash
npm install @activescott/filter-items
```

## Features

- **Numeric filters** - Range sliders with "at least" / "at most" operators
- **Categorical filters** - Checkbox multi-select with "only X" exclusive selection
- **URL sync** - Automatically sync filter state to URL parameters (optional)
- **Filter logic** - `applyFilters()` utility for client-side filtering
- **Responsive layout** - Desktop sidebar + mobile offcanvas via `FilterLayout`

## Quick Start

```tsx
import { useState, useMemo } from "react"
import {
  FilterItems,
  FilterLayout,
  applyFilters,
  type FilterConfig,
  type FilterState,
} from "@activescott/filter-items"

const filterConfigs: FilterConfig[] = [
  {
    type: "numeric",
    name: "price",
    displayName: "Budget",
    min: 0,
    max: 1000,
    step: 50,
    unit: "$",
    defaultOperator: "lte",
  },
  {
    type: "categorical",
    name: "category",
    displayName: "Category",
    options: [
      { value: "electronics", label: "Electronics" },
      { value: "clothing", label: "Clothing" },
    ],
  },
]

function MyFilteredList({ items }) {
  const [filters, setFilters] = useState<FilterState>({})

  const filtered = useMemo(
    () => applyFilters(items, filters, (item, field) => item[field]),
    [items, filters],
  )

  return (
    <FilterLayout
      filterPanel={
        <FilterItems
          configs={filterConfigs}
          filters={filters}
          onFilterChange={setFilters}
        />
      }
      filters={filters}
      configs={filterConfigs}
      onFilterChange={setFilters}
    >
      {filtered.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </FilterLayout>
  )
}
```

## URL Sync (Optional)

To sync filters with URL parameters:

```tsx
import {
  parseFiltersFromURL,
  updateURLWithFilters,
} from "@activescott/filter-items"

// Parse initial state from URL
const initialFilters = parseFiltersFromURL(new URLSearchParams(location.search))

// Update URL when filters change
const handleFilterChange = (filters) => {
  setFilters(filters)
  updateURLWithFilters(filters)
}
```

## Styling

Components use Bootstrap 5 classes. Include Bootstrap CSS in your app:

```tsx
import "bootstrap/dist/css/bootstrap.min.css"
```

## Example

See the `/example` directory for a complete working example.

## License

MIT
