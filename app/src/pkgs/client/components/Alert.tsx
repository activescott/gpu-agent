import React from "react"
import { BootstrapIcon, BootstrapIconName } from "./BootstrapIcon"

type AlertKind = "success" | "danger" | "warning" | "info"

interface AlertProps {
  children: React.ReactNode
  kind: AlertKind
}

const IconMap: Record<AlertKind, BootstrapIconName> = {
  success: "check-circle",
  danger: "exclamation-triangle",
  warning: "exclamation-circle",
  info: "info-circle",
}

export function Alert({ children, kind }: AlertProps): JSX.Element {
  const className = `alert alert-${kind} m-2`
  return (
    <div className={className} role="alert">
      <BootstrapIcon icon={IconMap[kind]} />
      &nbsp;{children}
    </div>
  )
}
