import {
  BootstrapIconName,
  BootstrapIcon,
} from "@/pkgs/client/components/BootstrapIcon"
import { SvgIcon } from "@/pkgs/client/components/SvgIcon"
import { ReactNode } from "react"

type TipCardProps = TipCardPropsIcon | TipCardSvgIcon

interface TipCardPropsIcon {
  icon: BootstrapIconName
  svgIcon?: undefined
  children: ReactNode
}

interface TipCardSvgIcon {
  icon?: undefined
  svgIcon: string
  children: ReactNode
}

export function TipCard({ children, icon, svgIcon }: TipCardProps) {
  return (
    <div className="d-inline-block m-2 rounded-3 shadow p-3 bg-body-tertiary max-width-30-md">
      <div className="d-flex flex-row p-2">
        <div className="d-inline-block me-2">
          {icon && <BootstrapIcon icon={icon} size="medium" />}
          {svgIcon && <SvgIcon icon={svgIcon} size="medium" />}
        </div>
        <div style={{ minHeight: "2lh" }}>{children}</div>
      </div>
    </div>
  )
}
