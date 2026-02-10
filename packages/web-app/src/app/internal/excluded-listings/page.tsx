"use client"

import { useState, useEffect, useCallback } from "react"
import {
  EXCLUDE_REASONS,
  type ExcludeReason,
} from "@/pkgs/isomorphic/model/listing"

interface ListingResult {
  itemId: string
  title: string
  priceValue: string
  gpuName: string
  gpuLabel: string
  cachedAt: string
  condition: string | null
  sellerUsername: string
  sellerFeedbackPercentage: string
  itemAffiliateWebUrl: string
  excludeReason?: string | null
}

interface ExclusionStat {
  reason: string
  count: number
}

interface ExcludedListingsData {
  listings: ListingResult[]
  total: number
  stats: ExclusionStat[]
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface SearchResultsData {
  listings: ListingResult[]
  total: number
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

const CURRENCY_DECIMAL_PLACES = 2
const ITEMS_PER_PAGE = 50

export default function ExcludedListingsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ExcludedListingsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [offset, setOffset] = useState(0)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResultsData | null>(
    null,
  )
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchOffset, setSearchOffset] = useState(0)
  const [excludingItemId, setExcludingItemId] = useState<string | null>(null)

  const fetchExcludedData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: offset.toString(),
      })
      if (selectedReason) {
        params.set("reason", selectedReason)
      }

      const response = await fetch(`/internal/api/excluded-listings?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [selectedReason, offset])

  useEffect(() => {
    fetchExcludedData()
  }, [fetchExcludedData])

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason)
    setOffset(0)
  }

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - ITEMS_PER_PAGE))
    }
  }

  const handleNextPage = () => {
    if (data?.pagination.hasMore) {
      setOffset(offset + ITEMS_PER_PAGE)
    }
  }

  const handleSearch = useCallback(
    async (queryOverride?: string, offsetOverride = 0) => {
      const q = queryOverride ?? searchQuery
      const off = offsetOverride

      if (!q.trim()) return

      setSearchLoading(true)
      setSearchError(null)

      try {
        const params = new URLSearchParams({
          q: q.trim(),
          limit: ITEMS_PER_PAGE.toString(),
          offset: off.toString(),
        })

        const response = await fetch(`/internal/api/search-listings?${params}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setSearchResults(result)
        setSearchOffset(off)
      } catch (error_) {
        setSearchError(
          error_ instanceof Error ? error_.message : "Search failed",
        )
      } finally {
        setSearchLoading(false)
      }
    },
    [searchQuery],
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchOffset(0)
    handleSearch(searchQuery, 0)
  }

  const handleSearchPrevPage = () => {
    if (searchOffset > 0) {
      const newOffset = Math.max(0, searchOffset - ITEMS_PER_PAGE)
      handleSearch(searchQuery, newOffset)
    }
  }

  const handleSearchNextPage = () => {
    if (searchResults?.pagination.hasMore) {
      handleSearch(searchQuery, searchOffset + ITEMS_PER_PAGE)
    }
  }

  const handleExclude = async (itemId: string, reason: ExcludeReason) => {
    setExcludingItemId(itemId)
    try {
      const response = await fetch("/internal/api/exclude-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, reason }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`,
        )
      }

      // Refresh both search results and excluded listings
      await Promise.all([
        handleSearch(searchQuery, searchOffset),
        fetchExcludedData(),
      ])
    } catch (error_) {
      setSearchError(
        error_ instanceof Error ? error_.message : "Failed to exclude listing",
      )
    } finally {
      setExcludingItemId(null)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="mb-2">Excluded Listings</h1>
      <p className="text-muted mb-4">
        Search active listings to find and exclude data quality issues. Excluded
        listings are preserved for ML training but omitted from all active and
        historical queries.
      </p>

      {/* Search Active Listings */}
      <div className="card mb-4 border-warning">
        <div className="card-header bg-warning bg-opacity-10">
          <h5 className="mb-0">Search Active Listings</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder='Search by title (e.g., "8x RTX 5090")...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-warning"
                disabled={searchLoading || !searchQuery.trim()}
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {searchError && (
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {searchError}
            </div>
          )}

          {searchResults && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">
                  {searchResults.total === 0
                    ? "No results found"
                    : `Showing ${searchOffset + 1}-${Math.min(searchOffset + ITEMS_PER_PAGE, searchResults.total)} of ${searchResults.total.toLocaleString()} active listings`}
                </span>
                {searchResults.total > ITEMS_PER_PAGE && (
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleSearchPrevPage}
                      disabled={searchOffset === 0}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleSearchNextPage}
                      disabled={!searchResults.pagination.hasMore}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {searchResults.listings.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>GPU</th>
                        <th>Price</th>
                        <th>Condition</th>
                        <th>Seller</th>
                        <th>Link</th>
                        <th>Exclude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.listings.map((listing) => (
                        <SearchResultRow
                          key={listing.itemId}
                          listing={listing}
                          onExclude={handleExclude}
                          isExcluding={excludingItemId === listing.itemId}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {data?.stats && data.stats.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Exclusion Statistics by Reason</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {data.stats.map((stat) => (
                    <div key={stat.reason} className="col-md-3 col-sm-6 mb-3">
                      <div
                        className={`card h-100 ${selectedReason === stat.reason ? "border-primary" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleReasonChange(
                            selectedReason === stat.reason ? "" : stat.reason,
                          )
                        }
                      >
                        <div className="card-body text-center">
                          <h6 className="card-subtitle mb-2 text-muted">
                            {stat.reason}
                          </h6>
                          <h3 className="card-title mb-0">
                            {stat.count.toLocaleString()}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <strong>Total Excluded:</strong>{" "}
                  {data.stats
                    .reduce((sum, s) => sum + s.count, 0)
                    .toLocaleString()}
                  {selectedReason && (
                    <button
                      className="btn btn-link btn-sm"
                      onClick={() => handleReasonChange("")}
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label htmlFor="reasonFilter" className="form-label">
                Filter by Reason
              </label>
              <select
                id="reasonFilter"
                className="form-select"
                value={selectedReason}
                onChange={(e) => handleReasonChange(e.target.value)}
              >
                <option value="">All Reasons</option>
                {Object.entries(EXCLUDE_REASONS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Showing</label>
              <p className="mb-0">
                {data
                  ? `${offset + 1}-${Math.min(offset + ITEMS_PER_PAGE, data.total)} of ${data.total.toLocaleString()}`
                  : "..."}
              </p>
            </div>
            <div className="col-md-4">
              <label className="form-label">Pagination</label>
              <div className="btn-group">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleNextPage}
                  disabled={!data?.pagination.hasMore}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading excluded listings...</p>
        </div>
      )}

      {/* Listings Table */}
      {data && !loading && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Excluded Listings</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>GPU</th>
                  <th>Price</th>
                  <th>Reason</th>
                  <th>Condition</th>
                  <th>Seller</th>
                  <th>Feedback</th>
                  <th>Cached</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {data.listings.map((listing) => (
                  <tr key={listing.itemId}>
                    <td>
                      <span
                        title={listing.title}
                        style={{
                          maxWidth: "300px",
                          display: "inline-block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {listing.title}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">{listing.gpuLabel}</small>
                    </td>
                    <td>
                      $
                      {Number.parseFloat(listing.priceValue).toFixed(
                        CURRENCY_DECIMAL_PLACES,
                      )}
                    </td>
                    <td>
                      <small>{listing.excludeReason || "-"}</small>
                    </td>
                    <td>{listing.condition || "-"}</td>
                    <td>
                      <small>{listing.sellerUsername}</small>
                    </td>
                    <td>{listing.sellerFeedbackPercentage}%</td>
                    <td>
                      <small>
                        {new Date(listing.cachedAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      {listing.itemAffiliateWebUrl && (
                        <a
                          href={listing.itemAffiliateWebUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.listings.length === 0 && (
            <div className="card-body text-center text-muted">
              No excluded listings found
              {selectedReason && ` for reason: ${selectedReason}`}
            </div>
          )}
        </div>
      )}

      {/* Bottom Pagination */}
      {data && !loading && data.total > ITEMS_PER_PAGE && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted">
            Showing {offset + 1}-{Math.min(offset + ITEMS_PER_PAGE, data.total)}{" "}
            of {data.total.toLocaleString()}
          </span>
          <div className="btn-group">
            <button
              className="btn btn-outline-secondary"
              onClick={handlePrevPage}
              disabled={offset === 0}
            >
              Previous
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={handleNextPage}
              disabled={!data.pagination.hasMore}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchResultRow({
  listing,
  onExclude,
  isExcluding,
}: {
  listing: ListingResult
  onExclude: (itemId: string, reason: ExcludeReason) => void
  isExcluding: boolean
}) {
  const [reason, setReason] = useState<ExcludeReason>(EXCLUDE_REASONS.BULK_SALE)

  return (
    <tr>
      <td>
        <span
          title={listing.title}
          style={{
            maxWidth: "300px",
            display: "inline-block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {listing.title}
        </span>
      </td>
      <td>
        <small className="text-muted">{listing.gpuLabel}</small>
      </td>
      <td>
        $
        {Number.parseFloat(listing.priceValue).toFixed(CURRENCY_DECIMAL_PLACES)}
      </td>
      <td>{listing.condition || "-"}</td>
      <td>
        <small>{listing.sellerUsername}</small>
      </td>
      <td>
        {listing.itemAffiliateWebUrl && (
          <a
            href={listing.itemAffiliateWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            View
          </a>
        )}
      </td>
      <td>
        <div className="d-flex gap-1">
          <select
            className="form-select form-select-sm"
            style={{ width: "130px" }}
            value={reason}
            onChange={(e) => setReason(e.target.value as ExcludeReason)}
            disabled={isExcluding}
          >
            {Object.entries(EXCLUDE_REASONS).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onExclude(listing.itemId, reason)}
            disabled={isExcluding}
          >
            {isExcluding ? "..." : "Exclude"}
          </button>
        </div>
      </td>
    </tr>
  )
}
