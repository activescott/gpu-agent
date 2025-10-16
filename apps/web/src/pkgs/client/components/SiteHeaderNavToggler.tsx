"use client"
import type { JSX } from "react"

export function SiteHeaderNavToggler(): JSX.Element {
  return (
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
      onClick={(e) => {
        // Hack to make the navbar collapse/expand when the toggler is clicked this replaces the only use of bootstrap's bundle
        // NOTE it does not handle animating hte expand/collapse
        const togglerButton = e.currentTarget
        togglerButton.classList.toggle("collapsed")
        const navbar = togglerButton.closest(".navbar")
        const collapseSection = navbar?.querySelector(".navbar-collapse")
        collapseSection?.classList.toggle("show")
      }}
    >
      <span className="navbar-toggler-icon"></span>
    </button>
  )
}
