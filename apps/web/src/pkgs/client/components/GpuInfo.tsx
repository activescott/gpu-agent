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

import type { JSX } from "react"

interface GpuInfoParams {
  gpu: Gpu
  minimumPrice: number
  activeListingCount: number
  gpuSpecPercentages: Record<GpuSpecKey, number>
}

const formatPercentage = new Intl.NumberFormat("en-US", {
  style: "percent",
})

export function GpuInfo({
  gpu,
  gpuSpecPercentages,
  minimumPrice,
  activeListingCount,
}: GpuInfoParams): JSX.Element {
  return (
    <>
      <h1>
        {gpu.label} {gpu.memoryCapacityGB}GB Specifications for AI Enthusiasts
      </h1>
      <p>{gpu.summary}</p>
      <ul>
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
      <table className="table">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>Raw Performance</th>
          </tr>
        </thead>
        <tbody>
          {GpuSpecKeys.map((key) => (
            <tr key={key}>
              <td>
                {GpuSpecsDescription[key].label}: {gpu[key]}
              </td>
              <td>
                <PercentBar percent={gpuSpecPercentages[key]}>
                  <abbr
                    title={`This GPU is in the ${formatPercentage.format(
                      gpuSpecPercentages[key],
                    )} percentile on this criteria.`}
                  >
                    {gpuSpecPercentages[key]
                      ? formatPercentage.format(gpuSpecPercentages[key])
                      : "N/A"}
                  </abbr>
                </PercentBar>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              The lowest price is{" "}
              <b>
                <FormatCurrency
                  currencyValue={minimumPrice}
                  forceInteger={true}
                />
              </b>
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
    </>
  )
}

function PercentBar({
  percent,
  children,
}: {
  percent: number
  children?: React.ReactNode
}): JSX.Element {
  const PERCENT_INT = 100
  const width = `${percent * PERCENT_INT}%`
  const QUARTILE_1 = 0.25,
    QUARTILE_2 = 0.5,
    QUARTILE_3 = 0.75
  let colorClass = "text-bg-success progress-bar-striped progress-bar-animated"
  if (Number.isNaN(percent) || percent < QUARTILE_1)
    colorClass = "text-bg-warning"
  else if (percent < QUARTILE_2) colorClass = "text-bg-info"
  else if (percent < QUARTILE_3) colorClass = "text-bg-success"

  return (
    <div
      className="progress mx-2"
      style={{ minWidth: "10rem" }}
      role="progressbar"
      aria-label="Warning example"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`progress-bar overflow-visible ${colorClass}`}
        style={{ width: width }}
      >
        {children}
      </div>
    </div>
  )
}
