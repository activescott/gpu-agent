import React from "react"
import { BootstrapIcon, BootstrapIconName } from "./BootstrapIcon"

//type AlertKind = "success" | "danger" | "warning" | "info"

interface AlertProps {
  children: React.ReactNode
  kind: AlertKind
}

const IconMap = {
  success: "check-circle" satisfies BootstrapIconName as BootstrapIconName,
  danger:
    "exclamation-triangle" satisfies BootstrapIconName as BootstrapIconName,
  warning:
    "exclamation-circle" satisfies BootstrapIconName as BootstrapIconName,
  info: "info-circle" satisfies BootstrapIconName as BootstrapIconName,
  secondary: "info-circle" satisfies BootstrapIconName as BootstrapIconName,
}

type AlertKind = keyof typeof IconMap

export function Alert({ children, kind }: AlertProps): JSX.Element {
  const className = `alert alert-${kind} m-2`
  return (
    <div className={className} role="alert">
      <BootstrapIcon icon={IconMap[kind]} />
      &nbsp;{children}
    </div>
  )
}
