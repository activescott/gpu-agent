import { useState, useMemo } from "react"
import {
  FilterItems,
  FilterLayout,
  applyFilters,
  type FilterConfig,
  type FilterState,
} from "@activescott/filter-items"

// Example product data
const products = [
  { id: 1, name: "Gaming Laptop", price: 1299, category: "Electronics", brand: "ASUS" },
  { id: 2, name: "Mechanical Keyboard", price: 149, category: "Electronics", brand: "Corsair" },
  { id: 3, name: "Running Shoes", price: 129, category: "Sports", brand: "Nike" },
  { id: 4, name: "Yoga Mat", price: 49, category: "Sports", brand: "Lululemon" },
  { id: 5, name: "Monitor 27\"", price: 399, category: "Electronics", brand: "Dell" },
  { id: 6, name: "Headphones", price: 249, category: "Electronics", brand: "Sony" },
  { id: 7, name: "Basketball", price: 39, category: "Sports", brand: "Spalding" },
  { id: 8, name: "Fitness Tracker", price: 199, category: "Electronics", brand: "Fitbit" },
]

type Product = typeof products[number]

// Filter configurations
const filterConfigs: FilterConfig[] = [
  {
    type: "numeric",
    name: "price",
    displayName: "Budget",
    min: 0,
    max: 1500,
    step: 50,
    unit: "$",
    defaultOperator: "lte",
  },
  {
    type: "categorical",
    name: "category",
    displayName: "Category",
    options: [
      { value: "Electronics", label: "Electronics" },
      { value: "Sports", label: "Sports" },
    ],
  },
  {
    type: "categorical",
    name: "brand",
    displayName: "Brand",
    options: [
      { value: "ASUS", label: "ASUS" },
      { value: "Corsair", label: "Corsair" },
      { value: "Nike", label: "Nike" },
      { value: "Lululemon", label: "Lululemon" },
      { value: "Dell", label: "Dell" },
      { value: "Sony", label: "Sony" },
      { value: "Spalding", label: "Spalding" },
      { value: "Fitbit", label: "Fitbit" },
    ],
  },
]

// Field value accessor for filtering
function getFieldValue(product: (typeof products)[0], field: string): unknown {
  return product[field as keyof typeof product]
}

export function App() {
  const [filters, setFilters] = useState<FilterState>({})

  // Apply filters to products
  const filteredProducts: Product[] = useMemo(
    () => applyFilters(products, filters, getFieldValue),
    [filters],
  )

  // Create filter panel
  const filterPanel = (
    <FilterItems
      configs={filterConfigs}
      filters={filters}
      onFilterChange={setFilters}
      title="Filter Products"
    />
  )

  return (
    <div className="container py-4">
      <h1 className="mb-4">Filter Items Example</h1>
      <p className="text-muted mb-4">
        This example demonstrates the @activescott/filter-items package with static product data.
      </p>

      <FilterLayout
        filterPanel={filterPanel}
        filters={filters}
        configs={filterConfigs}
        onFilterChange={setFilters}
      >
        {/* Show count if filtering */}
        {filteredProducts.length !== products.length && (
          <div className="text-muted mb-3">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}

        {/* Product grid */}
        <div className="row g-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted">{product.brand}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-secondary">{product.category}</span>
                    <span className="fw-bold text-primary">${product.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="alert alert-info mt-3">
            No products match your filters. Try adjusting your criteria.
          </div>
        )}
      </FilterLayout>
    </div>
  )
}
