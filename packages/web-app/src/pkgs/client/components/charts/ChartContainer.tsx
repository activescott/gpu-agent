"use client"

import type { JSX, ReactNode } from "react"
import ShareMenu from "./ShareMenu"
import "./charts.scss"

export interface ChartContainerProps {
  /** Title displayed above the chart */
  title: string
  /** The chart component to render */
  children: ReactNode
  /** URL to the shareable image (e.g., /api/og/chart/scalper-premium.png) */
  shareImageUrl?: string
  /** Page URL for sharing (defaults to current page) */
  shareUrl?: string
  /** Title used when sharing (defaults to chart title) */
  shareTitle?: string
  /** Hashtags for social sharing (without #) */
  hashtags?: string[]
}

/**
 * Container wrapper for charts with title and share functionality.
 * Provides consistent styling and optional share button.
 */
export function ChartContainer({
  title,
  children,
  shareImageUrl,
  shareUrl,
  shareTitle,
  hashtags = [],
}: ChartContainerProps): JSX.Element {
  return (
    <div className="chart-container">
      <div className="chart-container-header">
        <h4 className="chart-container-title">{title}</h4>
        {shareImageUrl && (
          <div className="chart-container-actions">
            <ShareMenu
              title={shareTitle ?? title}
              url={shareUrl}
              imageUrl={shareImageUrl}
              hashtags={hashtags}
            />
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default ChartContainer
