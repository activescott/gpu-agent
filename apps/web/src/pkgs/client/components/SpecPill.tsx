"use client"
import { useFloating, arrow, offset, FloatingArrow } from "@floating-ui/react"
import { ReactNode, useRef, useState } from "react"
import { BootstrapIcon } from "./BootstrapIcon"

interface SpecPillProps {
  children: ReactNode
  infoTipText: string
  infoTipLink?: string
  color?: BootstrapBackgroundColors
}

type BootstrapBackgroundColors =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark"

/**
 * A pill for a GPU specification.
 */
export const SpecPill = ({
  children,
  infoTipText,
  color = "secondary",
}: SpecPillProps) => {
  const [showTip, setShowTip] = useState(false)
  const arrowRef = useRef(null)
  // see https://floating-ui.com/docs/react
  const { refs, floatingStyles, context } = useFloating({
    middleware: [offset(8), arrow({ element: arrowRef })],
  })

  return (
    <>
      <span
        className={`badge rounded-pill text-bg-${color} mx-1`}
        ref={refs.setReference}
      >
        <span className="align-middle">{children}</span>
        &nbsp;
        <BootstrapIcon
          icon="info-circle"
          size="xs"
          onClick={() => setShowTip(!showTip)}
        />
      </span>

      {showTip && (
        <div
          id="infotip-backdrop"
          className="modal d-block"
          tabIndex={-1}
          onClick={() => setShowTip(false)}
        >
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            role="tooltip"
            className="tooltip show"
          >
            <FloatingArrow
              ref={arrowRef}
              context={context}
              className="tooltip-arrow"
            />
            <div className="tooltip-inner">{infoTipText}</div>
          </div>
        </div>
      )}
    </>
  )
}
