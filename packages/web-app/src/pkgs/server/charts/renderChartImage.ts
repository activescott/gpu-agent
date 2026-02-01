/**
 * Server-side chart rendering using chartjs-node-canvas.
 * Renders Chart.js charts to PNG buffers for image generation.
 */
import { ChartJSNodeCanvas } from "chartjs-node-canvas"
import type { ChartConfiguration } from "chart.js"
import type { ChartConfig } from "@/pkgs/isomorphic/model/news"
import {
  chartConfigToChartJS,
  BACKGROUND_COLOR,
} from "@/pkgs/isomorphic/charts"

/** Chart dimensions for the rendered chart area (not including header/footer) */
const CHART_WIDTH = 1104
const CHART_HEIGHT = 400

/**
 * Device pixel ratio for high-resolution rendering.
 * 2x provides sharp text on retina displays without excessive file sizes.
 */
const SCALE = 2

/** Singleton renderer instance for efficiency */
let chartRenderer: ChartJSNodeCanvas | null = null

/**
 * Gets or creates the singleton chart renderer.
 * Reusing the renderer is more efficient than creating a new one each time.
 * Uses 2x resolution for sharp text on retina displays.
 */
function getChartRenderer(): ChartJSNodeCanvas {
  if (!chartRenderer) {
    // Render at 2x dimensions for sharp text
    chartRenderer = new ChartJSNodeCanvas({
      width: CHART_WIDTH * SCALE,
      height: CHART_HEIGHT * SCALE,
      backgroundColour: BACKGROUND_COLOR,
      chartCallback: (ChartJS) => {
        // Set default font for crisp rendering
        ChartJS.defaults.font.family = "'Helvetica Neue', Arial, sans-serif"
      },
    })
  }
  return chartRenderer
}

/**
 * Renders a ChartConfig to a PNG buffer.
 *
 * @param config - The chart configuration to render
 * @returns PNG image data as a Buffer
 */
export async function renderChartToPng(config: ChartConfig): Promise<Buffer> {
  const renderer = getChartRenderer()

  // Convert our chart config to Chart.js configuration
  // Pass scale factor so fonts and elements are sized appropriately
  const chartJsConfig = chartConfigToChartJS(config, {
    serverSide: true,
    scale: SCALE,
  })

  // Render to PNG buffer
  const buffer = await renderer.renderToBuffer(
    chartJsConfig as ChartConfiguration,
  )

  return buffer
}

export { CHART_WIDTH, CHART_HEIGHT }
