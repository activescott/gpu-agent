import {
  Gpu,
  ManufacturerIdentifier,
  ThirdPartyProduct,
} from "@/pkgs/isomorphic/model"
import { Fragment } from "react"
import { GpuSpecKey } from "@/pkgs/isomorphic/model/specs"
import Link from "next/link"
import { Feature } from "./Feature"
import { FormatCurrency } from "./FormatCurrency"
import { GpuSpecsTable } from "./GpuSpecsTable"
import { GpuBenchmarksTable, BenchmarkPercentile } from "./GpuBenchmarksTable"
import { GpuQuickInfo } from "./GpuQuickInfo"
import { ProsCons } from "@/app/gpu/learn/card/[gpuSlug]/page"

import type { JSX } from "react"

// Re-export for backwards compatibility
export type { BenchmarkPercentile } from "./GpuBenchmarksTable"

interface GpuInfoParams {
  gpu: Gpu
  minimumPrice: number
  activeListingCount: number
  gpuSpecPercentages: Record<GpuSpecKey, number>
  gpuBenchmarkPercentiles?: BenchmarkPercentile[]
  prosCons?: ProsCons
}

/**
 * Formats manufacturer identifier type to human-readable label.
 */
function formatIdentifierType(type: string): string {
  const labels: Record<string, string> = {
    nvpn: "NVIDIA Part Number",
    board_id: "Board ID",
    product_sku: "Product SKU",
    opn: "AMD OPN",
    model_number: "Model Number",
    mm_number: "Material Master",
    spec_code: "Spec Code",
    product_code: "Product Code",
  }
  return labels[type.toLowerCase()] || type.replaceAll("_", " ").toUpperCase()
}

/**
 * Groups third-party products by company name.
 */
function groupByCompany(
  products: ThirdPartyProduct[],
): Record<string, ThirdPartyProduct[]> {
  return products.reduce(
    (acc, product) => {
      if (!acc[product.company]) acc[product.company] = []
      acc[product.company].push(product)
      return acc
    },
    {} as Record<string, ThirdPartyProduct[]>,
  )
}

/**
 * Counts unique companies in the third-party products list.
 */
function countUniqueCompanies(products: ThirdPartyProduct[]): number {
  return new Set(products.map((p) => p.company)).size
}

export function GpuInfo({
  gpu,
  gpuSpecPercentages,
  minimumPrice,
  activeListingCount,
  gpuBenchmarkPercentiles,
  prosCons,
}: GpuInfoParams): JSX.Element {
  return (
    <>
      <h1>
        {gpu.label} {gpu.memoryCapacityGB}GB Specs, Benchmarks & Pricing
      </h1>
      <p>{gpu.summary}</p>
      <GpuQuickInfo gpu={gpu} />

      {/* Strengths and Considerations - visible for Google structured data matching */}
      {prosCons &&
        (prosCons.positiveNotes.length > 0 ||
          prosCons.negativeNotes.length > 0) && (
          <div className="row mt-4 mb-4">
            {prosCons.positiveNotes.length > 0 && (
              <div className="col-md-6">
                <h3 className="h6 text-success">Strengths</h3>
                <ul className="small mb-0">
                  {prosCons.positiveNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            {prosCons.negativeNotes.length > 0 && (
              <div className="col-md-6">
                <h3 className="h6 text-warning">Considerations</h3>
                <ul className="small mb-0">
                  {prosCons.negativeNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      <GpuSpecsTable gpu={gpu} gpuSpecPercentages={gpuSpecPercentages} />

      {gpuBenchmarkPercentiles && gpuBenchmarkPercentiles.length > 0 && (
        <GpuBenchmarksTable
          gpuLabel={gpu.label}
          benchmarkPercentiles={gpuBenchmarkPercentiles}
        />
      )}

      <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
        <Feature
          title={`Real-time ${gpu.label} GPU Prices`}
          icon="gpu-card"
          callToAction="Buy Now"
          callToActionLink={`/ml/shop/gpu/${gpu.name}`}
        >
          We&apos;re tracking <em>{activeListingCount}</em> of the {gpu.label}{" "}
          GPUs currently available for sale.{" "}
          {activeListingCount > 0 && (
            <span>
              The lowest average price is{" "}
              <b>
                <FormatCurrency
                  currencyValue={minimumPrice}
                  forceInteger={true}
                />
              </b>{" "}
              <Link
                href="/gpu/learn/faq#lowest-average-price"
                className="text-muted small"
              >
                (what&apos;s this?)
              </Link>
            </span>
          )}
        </Feature>
        <Feature
          title={`Compare Price/Performance to other GPUs`}
          icon="shop-window"
          callToAction="Compare GPU Price/Performance"
          callToActionLink={`/ml/learn/gpu/ranking`}
        >
          We track real-time prices of other GPUs too so that you can compare
          the price/performance of the {gpu.label} GPU to other GPUs.
        </Feature>
        <Feature
          title={`Compare ${gpu.label} to Another GPU`}
          icon="arrows-expand"
          callToAction="Compare GPUs Side-by-Side"
          callToActionLink={`/gpu/compare`}
        >
          Compare the {gpu.label} directly to another GPU to see specs,
          benchmarks, and prices side-by-side.
        </Feature>
      </div>

      {/* Product Identifiers Section - SEO-optimized, collapsible for minimal UX impact */}
      {((gpu.manufacturerIdentifiers &&
        gpu.manufacturerIdentifiers.length > 0) ||
        (gpu.thirdPartyProducts && gpu.thirdPartyProducts.length > 0)) && (
        <section className="mt-4" aria-labelledby="product-identifiers-heading">
          <h2 id="product-identifiers-heading" className="h6 text-muted">
            Product Identifiers
          </h2>

          {gpu.manufacturerIdentifiers &&
            gpu.manufacturerIdentifiers.length > 0 && (
              <details className="mb-3">
                <summary
                  className="text-muted small"
                  style={{ cursor: "pointer" }}
                >
                  Manufacturer Part Numbers (
                  {gpu.manufacturerIdentifiers.length})
                </summary>
                <dl className="row small mt-2 ms-2 mb-0">
                  {gpu.manufacturerIdentifiers.map(
                    (id: ManufacturerIdentifier, idx: number) => (
                      <Fragment key={idx}>
                        <dt className="col-sm-4 text-muted">
                          {formatIdentifierType(id.type)}
                        </dt>
                        <dd className="col-sm-8 font-monospace text-break">
                          {id.value}
                        </dd>
                      </Fragment>
                    ),
                  )}
                </dl>
              </details>
            )}

          {gpu.thirdPartyProducts && gpu.thirdPartyProducts.length > 0 && (
            <details className="mb-3">
              <summary
                className="text-muted small"
                style={{ cursor: "pointer" }}
              >
                Available from {countUniqueCompanies(gpu.thirdPartyProducts)}{" "}
                Partners ({gpu.thirdPartyProducts.length} products)
              </summary>
              <div className="mt-2 ms-2">
                {Object.entries(groupByCompany(gpu.thirdPartyProducts)).map(
                  ([company, products]) => (
                    <div key={company} className="mb-2">
                      <strong className="small">{company}</strong>
                      <dl className="row small mb-0 ms-2">
                        {products.map(
                          (product: ThirdPartyProduct, idx: number) => (
                            <Fragment key={idx}>
                              <dt className="col-12 text-muted">
                                {product.productName}
                              </dt>
                              <dd className="col-12 font-monospace ps-3 text-break">
                                {product.identifier}
                                <span className="text-muted ms-1">
                                  ({product.identifierType.replaceAll("_", " ")}
                                  )
                                </span>
                              </dd>
                            </Fragment>
                          ),
                        )}
                      </dl>
                    </div>
                  ),
                )}
              </div>
            </details>
          )}
        </section>
      )}

      <h2>References</h2>
      <ul>
        {gpu.references.map((ref) => (
          <li key={ref}>
            <Link href={ref}>{ref}</Link>
          </li>
        ))}
      </ul>

      {gpu.notes && gpu.notes.length > 0 && (
        <>
          <h2 className="h6 text-muted mt-4">Notes</h2>
          <ol className="small text-muted" style={{ fontSize: "0.75rem" }}>
            {gpu.notes.map((note, index) => (
              <li key={index} className="mb-1">
                {note}
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  )
}
