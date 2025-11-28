"use client"

import { useState, useEffect, type JSX } from "react"
import { BootstrapIcon } from "./BootstrapIcon"
import Link from "next/link"

const STORAGE_KEY = "domain-migration-banner-dismissed"

export function DomainMigrationBanner(): JSX.Element | null {
  const [isDismissed, setIsDismissed] = useState(true) // Start hidden to avoid flash

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    setIsDismissed(dismissed === "true")
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsDismissed(true)
  }

  if (isDismissed) {
    return null
  }

  return (
    <div
      className="alert alert-info alert-dismissible fade show m-2"
      role="alert"
    >
      <BootstrapIcon icon="info-circle" />
      &nbsp;
      <strong>Formerly coinpoet.com</strong> - We&apos;ve moved to a new domain!
      Same great GPU price comparisons, new address.{" "}
      <Link href="/news/gpupoet-domain-migration" className="alert-link">
        Learn more
      </Link>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={handleDismiss}
      />
    </div>
  )
}
