/**
 * Composes a complete chart image with header, footer, and watermark.
 * Uses Node canvas API to draw the final image at 2x resolution for sharp text.
 */
import { createCanvas, loadImage } from "canvas"
import path from "path"
import type { ChartConfig } from "@/pkgs/isomorphic/model/news"
import { renderChartToPng, CHART_WIDTH, CHART_HEIGHT } from "./renderChartImage"

/** Final image dimensions (standard OG image size) */
const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630

/**
 * Device pixel ratio for high-resolution rendering.
 * 2x provides sharp text on retina displays.
 */
const SCALE = 2

/** Scaled dimensions for the canvas (internal rendering) */
const CANVAS_WIDTH = IMAGE_WIDTH * SCALE
const CANVAS_HEIGHT = IMAGE_HEIGHT * SCALE

/** Colors for the composed image */
const BACKGROUND_COLOR = "#ffffff"
const TEXT_COLOR = "#374151"
const BRAND_COLOR = "#d11363" // GPUPoet brand pink

/** Layout positions (in logical pixels, will be scaled) */
const HEADER_Y = 50
const CHART_X = (IMAGE_WIDTH - CHART_WIDTH) / 2 // Center the chart
const CHART_Y = 100
const FOOTER_Y = 580

/** Font settings (sizes in logical pixels, will be scaled) */
const TITLE_FONT_SIZE = 32
const BRAND_FONT_SIZE = 28
const FOOTER_FONT_SIZE = 18
const FONT_FAMILY = "'Helvetica Neue', Arial, sans-serif"

/** Logo dimensions */
const LOGO_SIZE = 48

export interface ComposeOptions {
  /** Chart title (displayed at top) */
  title?: string
  /** Optional date to display in footer */
  date?: Date
}

// Canvas 2D context type alias for simplicity
type Ctx2D = ReturnType<ReturnType<typeof createCanvas>["getContext"]>

/** Cached logo image */
let cachedLogo: Awaited<ReturnType<typeof loadImage>> | null = null

/**
 * Loads the GPU icon logo image (cached for reuse).
 * Uses SVG for sharp rendering at any scale.
 */
async function getLogoImage(): Promise<Awaited<ReturnType<typeof loadImage>>> {
  if (!cachedLogo) {
    const logoPath = path.join(
      process.cwd(),
      "public/images/coinpoet-card-128.png",
    )
    cachedLogo = await loadImage(logoPath)
  }
  return cachedLogo
}

/**
 * Creates a complete shareable chart image with header, footer, and branding.
 * Renders at 2x resolution for sharp text on retina displays.
 *
 * Layout:
 * - Header: Logo + "GPUPoet.com" (left) + Title (right)
 * - Chart: Centered Chart.js render
 * - Footer: Data attribution (left) + date (right)
 *
 * @param config - Chart configuration to render
 * @param options - Composition options (title, date)
 * @returns PNG image data as a Buffer
 */
export async function composeChartImage(
  config: ChartConfig,
  options: ComposeOptions = {},
): Promise<Buffer> {
  // Load logo and render chart in parallel
  const [logoImage, chartBuffer] = await Promise.all([
    getLogoImage(),
    renderChartToPng(config),
  ])
  const chartImage = await loadImage(chartBuffer)

  // Create the final canvas at 2x resolution
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  const ctx = canvas.getContext("2d")

  // Scale all drawing operations
  ctx.scale(SCALE, SCALE)

  // Fill background
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)

  // Draw header with logo and brand
  await drawHeader(ctx, logoImage, options.title ?? config.title)

  // Draw the chart (centered) - scale down from 2x chart render
  ctx.drawImage(chartImage, CHART_X, CHART_Y, CHART_WIDTH, CHART_HEIGHT)

  // Draw footer
  drawFooter(ctx, options.date)

  // Return as PNG buffer
  return canvas.toBuffer("image/png")
}

/**
 * Draws the header with logo, brand name, and title.
 * Logo is drawn at 2x resolution by temporarily resetting scale.
 */
async function drawHeader(
  ctx: Ctx2D,
  logoImage: Awaited<ReturnType<typeof loadImage>>,
  title: string,
): Promise<void> {
  const padding = 48
  const logoX = padding
  const logoY = HEADER_Y - LOGO_SIZE / 2

  // Draw logo at native resolution for sharpness
  // Save current transform and temporarily reset scale
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset to identity matrix
  // Draw at scaled coordinates with scaled size
  ctx.drawImage(
    logoImage,
    logoX * SCALE,
    logoY * SCALE,
    LOGO_SIZE * SCALE,
    LOGO_SIZE * SCALE,
  )
  ctx.restore() // Restore 2x scale for remaining drawing

  // Brand name next to logo
  const brandX = logoX + LOGO_SIZE + 12
  ctx.fillStyle = BRAND_COLOR
  ctx.font = `bold ${BRAND_FONT_SIZE}px ${FONT_FAMILY}`
  ctx.textAlign = "left"
  ctx.textBaseline = "middle"
  ctx.fillText("GPUPoet.com", brandX, HEADER_Y)

  // Title on the right
  ctx.fillStyle = TEXT_COLOR
  ctx.font = `bold ${TITLE_FONT_SIZE}px ${FONT_FAMILY}`
  ctx.textAlign = "right"

  // Truncate title if too long
  const maxTitleWidth =
    IMAGE_WIDTH - brandX - ctx.measureText("GPUPoet.com").width - 100
  let displayTitle = title
  while (
    ctx.measureText(displayTitle).width > maxTitleWidth &&
    displayTitle.length > 10
  ) {
    displayTitle = displayTitle.slice(0, -4) + "..."
  }
  ctx.fillText(displayTitle, IMAGE_WIDTH - padding, HEADER_Y)
}

/**
 * Draws the footer with data attribution and date.
 */
function drawFooter(ctx: Ctx2D, date?: Date): void {
  const padding = 48

  ctx.fillStyle = TEXT_COLOR
  ctx.font = `${FOOTER_FONT_SIZE}px ${FONT_FAMILY}`
  ctx.textBaseline = "middle"

  // Attribution on the left
  ctx.textAlign = "left"
  ctx.fillText(
    "Data from GPUPoet.com • Real-time GPU price tracking",
    padding,
    FOOTER_Y,
  )

  // Date on the right
  if (date) {
    ctx.textAlign = "right"
    const dateStr = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    ctx.fillText(dateStr, IMAGE_WIDTH - padding, FOOTER_Y)
  }
}

export { IMAGE_WIDTH, IMAGE_HEIGHT }
