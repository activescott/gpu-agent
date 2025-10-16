import { BootstrapIcon, BootstrapIconName } from "./BootstrapIcon"

import type { JSX } from "react"

export function Feature({
  title,
  children,
  icon,
  callToAction,
  callToActionLink,
}: {
  title: string
  children: React.ReactNode
  icon: BootstrapIconName
  callToAction?: string
  callToActionLink?: string
}): JSX.Element {
  return (
    <div className="col d-flex align-items-start">
      <div className="d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3 text-primary">
        <BootstrapIcon icon={icon} />
      </div>
      <div>
        <h3 className="fs-4 text-body-emphasis">{title}</h3>
        <div>{children}</div>
        {callToAction && callToActionLink && (
          <a href={callToActionLink} className="btn btn-primary mt-2">
            {callToAction}
          </a>
        )}
      </div>
    </div>
  )
}
