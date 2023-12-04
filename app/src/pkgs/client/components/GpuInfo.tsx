import { Gpu } from "@/pkgs/isomorphic/model"
import { GpuSpecKeys, GpuSpecsDescription } from "@/pkgs/isomorphic/model/specs"
import Link from "next/link"
import { BootstrapIcon, BootstrapIconName } from "./BootstrapIcon"

interface GpuInfoParams {
  gpu: Gpu
  averagePrice: number
  activeListingCount: number
}

const formatPrice = (price: number): string => {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}
export function GpuInfo({
  gpu,
  averagePrice,
  activeListingCount,
}: GpuInfoParams): JSX.Element {
  return (
    <>
      <h1>{gpu.label} Machine Learning GPU</h1>
      <p>{gpu.summary}</p>

      <h2>Specifications for {gpu.label}</h2>
      <ul>
        {GpuSpecKeys.map((key) => (
          <li key={key}>
            {GpuSpecsDescription[key].label}: {gpu[key]}
          </li>
        ))}
      </ul>

      <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
        <Feature
          title={`Real-time ${gpu.label} GPU Prices`}
          icon="gpu-card"
          callToAction="Shop"
          callToActionLink={`/ml/shop/gpu/${gpu.name}`}
        >
          We track real-time prices of the <em>{gpu.label}</em> GPU. We are
          tracking <em>{activeListingCount}</em> currently available for sale.{" "}
          {activeListingCount > 0 && (
            <span>
              The average price is <em>{formatPrice(averagePrice)}</em>
            </span>
          )}
        </Feature>
        <Feature
          title={`Compare Price/Performance to other GPUs`}
          icon="shop-window"
          callToAction="Compare GPU Price/Performance"
          callToActionLink={`/ml/shop/gpu`}
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

function Feature({
  title,
  children,
  icon,
  callToAction,
  callToActionLink,
}: {
  title: string
  children: React.ReactNode
  icon: BootstrapIconName
  callToAction: string
  callToActionLink: string
}): JSX.Element {
  return (
    <div className="col d-flex align-items-start">
      <div className="d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3 text-primary">
        <BootstrapIcon icon={icon} />
      </div>
      <div>
        <h3 className="fs-4 text-body-emphasis">{title}</h3>
        <div>{children}</div>
        <a href={callToActionLink} className="btn btn-primary mt-2">
          {callToAction}
        </a>
      </div>
    </div>
  )
}
