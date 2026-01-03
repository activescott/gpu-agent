/**
 * Layout for Market Report pages.
 * Provides shared structure for all market reports.
 */
import type { ReactNode } from "react"

export default function MarketReportLayout({
  children,
}: {
  children: ReactNode
}): ReactNode {
  return <>{children}</>
}
