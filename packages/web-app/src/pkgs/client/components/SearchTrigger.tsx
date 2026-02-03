"use client"

import { useCallback, useEffect, useState, type JSX } from "react"
import dynamic from "next/dynamic"
import { BootstrapIcon } from "./BootstrapIcon"

const SearchDialog = dynamic(() => import("./SearchDialog"), { ssr: false })

export function SearchTrigger(): JSX.Element {
  const [open, setOpen] = useState(false)
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"))
  }, [])

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  // Global keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        className="search-trigger"
        onClick={handleOpen}
        aria-label="Search"
        data-testid="search-trigger"
      >
        <BootstrapIcon icon="search" size="xs" />
        <span className="search-trigger-text d-none d-md-inline">
          Search...
        </span>
        <kbd className="search-trigger-kbd d-none d-lg-inline">
          {isMac ? "\u2318" : "Ctrl"}K
        </kbd>
      </button>
      {open && <SearchDialog onClose={handleClose} />}
    </>
  )
}
