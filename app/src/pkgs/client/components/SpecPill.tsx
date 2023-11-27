"use client"
import { usePopper } from "react-popper"
import { ReactNode, useState } from "react"
import { BootstrapIcon } from "./BootstrapIcon"

interface SpecPillProps {
  children: ReactNode
  infoTipText: string
  infoTipLink?: string
}

/**
 * A pill for a GPU specification.
 */
export const SpecPill = ({ children, infoTipText }: SpecPillProps) => {
  const [showTip, setShowTip] = useState(false)
  // see https://popper.js.org/react-popper/v2/
  const [referenceElement, setReferenceElement] =
    useState<HTMLSpanElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  )
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [{ name: "arrow", options: { element: arrowElement } }],
  })
  return (
    <>
      <span
        className="badge rounded-pill text-bg-secondary mx-1"
        ref={setReferenceElement}
      >
        {children}
        <BootstrapIcon
          icon="info-circle"
          size="xs"
          onClick={() => setShowTip(!showTip)}
        />
      </span>

      {showTip && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          role="tooltip"
          className="tooltip show"
        >
          <div
            className="tooltip-arrow"
            ref={setArrowElement}
            style={styles.arrow}
          ></div>
          <div className="tooltip-inner">{infoTipText}</div>
        </div>
      )}
    </>
  )
}
