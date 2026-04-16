/* eslint-disable unicorn/filename-case, import/no-unused-modules -- Next.js requires lowercase `not-found.tsx` filename and a default export for route-segment 404 handling */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  formatYearMonthSlug,
  getCurrentYearMonth,
} from "@/pkgs/isomorphic/yearMonth"

/**
 * Extracts the GPU slug from the current pathname if it matches the
 * price-by-month route pattern. Returns null if the URL doesn't look
 * like a GPU price route.
 */
function extractGpuSlug(pathname: string | null): string | null {
  if (!pathname) return null
  // Expected shape: /gpu/learn/price/[yearMonth]/[gpuSlug]
  const match = pathname.match(/^\/gpu\/learn\/price\/[^/]+\/([\da-z-]+)\/?$/i)
  if (!match) return null
  const candidate = match[1]
  // Basic sanity check — real GPU slugs have at least a manufacturer + name
  if (!candidate.includes("-")) return null
  return candidate
}

/**
 * Turns a GPU slug into a readable label as a best-effort fallback for
 * CTAs when we don't have access to the DB (client component, no fetch).
 */
function prettifyGpuSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => {
      if (/^(nvidia|amd|intel)$/i.test(part)) return part.toUpperCase()
      if (/^(rtx|gtx|rx|tx)$/i.test(part)) return part.toUpperCase()
      if (/^(ti|xt|xtx|super|pro)$/i.test(part)) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      }
      if (/^\d+[a-z]*$/i.test(part)) return part.toUpperCase()
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(" ")
}

export default function NotFound(): JSX.Element {
  const pathname = usePathname()
  const gpuSlug = extractGpuSlug(pathname)
  const current = getCurrentYearMonth()
  const currentSlug = formatYearMonthSlug(current.year, current.month)

  return (
    <div className="container py-5">
      <div className="text-center">
        <h1 className="h2 mb-3">Price Page Not Available</h1>
        {gpuSlug ? (
          <>
            <p className="lead mb-4">
              We don&apos;t have price data for the {prettifyGpuSlug(gpuSlug)}{" "}
              in that month. We track prices starting in January 2026 and only
              publish pages for months that have already started.
            </p>
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <Link
                href={`/gpu/learn/price/${currentSlug}/${gpuSlug}`}
                className="btn btn-primary btn-lg"
              >
                See {prettifyGpuSlug(gpuSlug)} Price for {current.display} →
              </Link>
              <Link
                href={`/gpu/shop/${gpuSlug}`}
                className="btn btn-outline-primary btn-lg"
              >
                Shop {prettifyGpuSlug(gpuSlug)} Deals
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="lead mb-4">
              We only have pricing pages for months from January 2026 onward,
              once each month has started.
            </p>
            <Link href="/gpu/price-compare" className="btn btn-primary btn-lg">
              Browse Current GPU Prices ({current.display})
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
