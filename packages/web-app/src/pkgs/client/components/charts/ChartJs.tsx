"use client"

import { Suspense, lazy, useEffect, useRef, useState } from "react"
import type { ChartConfig } from "@/pkgs/isomorphic/model/news"
import "./charts.scss"

// Lazy load the Chart.js implementation to reduce initial bundle size
const ChartJSImpl = lazy(() => import("./ChartJsImpl"))

// Default chart heights by type
const DEFAULT_LINE_CHART_HEIGHT = 400
const DEFAULT_BAR_CHART_HEIGHT = 300

export interface ChartJSProps {
  /** The chart configuration to render */
  config: ChartConfig
  /** Optional height for the chart (default: 300px for bar charts, 400px for line charts) */
  height?: number
  /** Title shown above the chart */
  title?: string
  /** Whether to show watermark in bottom-right. Default: false */
  showWatermark?: boolean
  /** Additional CSS class names */
  className?: string
}

/**
 * Loading placeholder for lazy-loaded Chart.js
 */
function ChartLoadingPlaceholder({ height }: { height: number }): JSX.Element {
  return (
    <div
      className="chart-loading-placeholder"
      style={{ height, minHeight: height }}
    >
      <div className="chart-loading-spinner" />
    </div>
  )
}

/**
 * Chart.js wrapper component that lazy-loads the chart implementation
 * and adds scroll-triggered animation.
 */
export function ChartJS({
  config,
  height,
  title,
  showWatermark = false,
  className = "",
}: ChartJSProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Default heights based on chart type
  const defaultHeight =
    config.chartType === "line"
      ? DEFAULT_LINE_CHART_HEIGHT
      : DEFAULT_BAR_CHART_HEIGHT
  const chartHeight = height ?? defaultHeight

  // Use IntersectionObserver to trigger animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (chartRef.current) {
      observer.observe(chartRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={chartRef}
      className={`chartjs-wrapper ${isVisible ? "in-view" : ""} ${className}`}
    >
      {title && <h4 className="chartjs-title">{title}</h4>}
      <div
        className="chartjs-container"
        style={{ height: chartHeight, minHeight: chartHeight }}
      >
        <Suspense fallback={<ChartLoadingPlaceholder height={chartHeight} />}>
          {isVisible && <ChartJSImpl config={config} height={chartHeight} />}
        </Suspense>
      </div>
      {showWatermark && <div className="chartjs-watermark">gpupoet.com</div>}
    </div>
  )
}

export default ChartJS
