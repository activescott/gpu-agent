import { type JSX, type ReactNode } from "react"

interface CollapsibleProps {
  title: ReactNode
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

/**
 * A React-controlled collapsible section using Bootstrap accordion styling.
 * Does not depend on Bootstrap JS — open/close is managed by the parent.
 */
export function Collapsible({
  title,
  isOpen,
  onToggle,
  children,
}: CollapsibleProps): JSX.Element {
  return (
    <div className="accordion-item border-0">
      <h2 className="accordion-header">
        <button
          className={`accordion-button ${isOpen ? "" : "collapsed"} px-0 py-2 fw-semibold`}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          style={{
            fontSize: "0.95rem",
            boxShadow: "none",
            backgroundColor: "transparent",
            borderRadius: 0,
          }}
        >
          {title}
        </button>
      </h2>
      <div
        className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
      >
        <div className="accordion-body px-0 pt-2 pb-3">{children}</div>
      </div>
    </div>
  )
}
