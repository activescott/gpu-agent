import { Gpu } from "@/pkgs/isomorphic/model"
import { GpuSpecKeys, GpuSpecsDescription } from "@/pkgs/isomorphic/model/specs"
import Link from "next/link"

interface GpuInfoParams {
  gpu: Gpu
}

export function GpuInfo(params: GpuInfoParams): JSX.Element {
  const { gpu } = params
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
