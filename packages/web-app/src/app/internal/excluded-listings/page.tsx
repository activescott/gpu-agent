"use client"

import { useState, useEffect, useCallback } from "react"
import { EXCLUDE_REASONS } from "@/pkgs/isomorphic/model/listing"

interface ExcludedListing {
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
}

interface ExclusionStat {
  reason: string
  count: number
}

interface ExcludedListingsData {
  listings: ExcludedListing[]
  total: number
  stats: ExclusionStat[]
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

export default function ExcludedListingsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ExcludedListingsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [offset, setOffset] = useState(0)
  const ITEMS_PER_PAGE = 50

  const fetchData = useCallback(async () => {
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
    fetchData()
  }, [fetchData])

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason)
    setOffset(0) // Reset to first page when filter changes
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

  return (
    <div className="container py-4">
      <h1 className="mb-2">Excluded Listings</h1>
      <p className="text-muted mb-4">
        View listings excluded for data quality issues. These listings are
        preserved for ML training but excluded from all active and historical
        queries.
      </p>

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
                    <td>${Number.parseFloat(listing.priceValue).toFixed(2)}</td>
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
