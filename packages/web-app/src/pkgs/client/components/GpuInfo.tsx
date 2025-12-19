import { Gpu } from "@/pkgs/isomorphic/model"
import {
  GpuSpecKey,
  GpuSpecKeys,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import Link from "next/link"
import { Feature } from "./Feature"
import { FormatCurrency } from "./FormatCurrency"
import { BootstrapIcon } from "./BootstrapIcon"
import { PercentileProgressBar, NoDataBar } from "./PercentileProgressBar"

import type { JSX } from "react"

export interface BenchmarkPercentile {
  slug: string
  name: string
  unit: string
  value: number | undefined
  percentile: number | undefined
}

interface GpuInfoParams {
  gpu: Gpu
  minimumPrice: number
  activeListingCount: number
  gpuSpecPercentages: Record<GpuSpecKey, number>
  gpuBenchmarkPercentiles?: BenchmarkPercentile[]
}

/**
 * Formats a release date string (e.g., "2022-10-12") to a human-readable format.
 */
function formatReleaseDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Formats MSRP as a currency string with USD suffix.
 */
function formatMsrp(msrpUSD: number): string {
  return `$${msrpUSD.toLocaleString()} USD`
}

export function GpuInfo({
  gpu,
  gpuSpecPercentages,
  minimumPrice,
  activeListingCount,
  gpuBenchmarkPercentiles,
}: GpuInfoParams): JSX.Element {
  return (
    <>
      <h1>
        {gpu.label} {gpu.memoryCapacityGB}GB Specifications for AI Enthusiasts
      </h1>
      <p>{gpu.summary}</p>
      <ul>
        {gpu.releaseDate && (
          <li>Release Date: {formatReleaseDate(gpu.releaseDate)}</li>
        )}
        {gpu.msrpUSD && <li>MSRP: {formatMsrp(gpu.msrpUSD)}</li>}
        <li>GPU Architecture: {gpu.gpuArchitecture}</li>
        <li>
          {/* TODO: Review https://docs.nvidia.com/deeplearning/performance/dl-performance-gpu-background/index.html#gpu-arch__fig2 */}
          Hardware-Accelerated{" "}
          <abbr title="Generalized Matrix Multiplication">GEMM</abbr>{" "}
          Operations:
          <div className="d-flex flex-row flex-wrap">
            {[
              "FP16",
              "FP32",
              "BF16",
              "FP8",
              "INT8",
              "INT4",
              "TF32",
              "FP64",
              "INT1",
            ].map((precision) => {
              const supported =
                gpu.supportedHardwareOperations.includes(precision)
              const title = supported ? "supported" : "not supported"
              const icon = supported ? "check-circle" : "dash-circle"
              const colorClass = supported ? "text-success" : "text-warning"

              return (
                <span
                  key={precision}
                  className={`mx-2 my-1 text-nowrap fs-6 ${colorClass}`}
                >
                  <abbr title={title}>
                    <BootstrapIcon icon={icon} size="xs" alt={title} />
                  </abbr>{" "}
                  {precision}
                </span>
              )
            })}
          </div>
        </li>
        <li>
          CUDA Compute Capability{" "}
          <span className={`mx-2 my-1 text-nowrap fs-6`}>
            <abbr title="CUDA Compute Capability refers to the version of the CUDA libraries that the card supports. For the purposes of Machine Learning some notable versions are 5.3 where 16-bit floating point (FP16) operations were introduced and 8.0 where the so-called 'brain floating point' (BF16) was introduced which is a floating point type optimized for machine learning. CUDA is only available for NVIDIA GPUs.">
              <BootstrapIcon icon="info-circle" size="xs" />
            </abbr>
          </span>
          : {gpu.supportedCUDAComputeCapability ?? "n/a"}{" "}
        </li>
      </ul>

      <h2>Specifications for {gpu.label}</h2>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>Specification</th>
              <th style={{ minWidth: "250px" }}>Performance Ranking</th>
            </tr>
          </thead>
          <tbody>
            {GpuSpecKeys.map((key) => {
              const specValue = gpu[key]
              const percentile = gpuSpecPercentages[key]
              const specDesc = GpuSpecsDescription[key]
              const hasData =
                specValue !== null &&
                specValue !== undefined &&
                percentile !== null &&
                percentile !== undefined

              return (
                <tr key={key}>
                  <td style={{ whiteSpace: "nowrap" }}>{specDesc.label}</td>
                  <td>
                    {hasData ? (
                      <PercentileProgressBar
                        percentile={percentile}
                        value={specValue}
                        unit={specDesc.unitShortest}
                      />
                    ) : (
                      <NoDataBar />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {gpuBenchmarkPercentiles && gpuBenchmarkPercentiles.length > 0 && (
        <>
          <h2 className="mt-4">Gaming Benchmarks for {gpu.label}</h2>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Benchmark</th>
                  <th style={{ minWidth: "250px" }}>Performance Ranking</th>
                </tr>
              </thead>
              <tbody>
                {gpuBenchmarkPercentiles.map((benchmark) => (
                  <tr key={benchmark.slug}>
                    <td style={{ whiteSpace: "nowrap" }}>{benchmark.name}</td>
                    <td>
                      {benchmark.value !== undefined &&
                      benchmark.percentile !== undefined ? (
                        <PercentileProgressBar
                          percentile={benchmark.percentile}
                          value={benchmark.value}
                          unit={benchmark.unit}
                        />
                      ) : (
                        <NoDataBar />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
      </div>

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
