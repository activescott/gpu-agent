/**
 * Composes a complete chart image with header, footer, and watermark.
 * Uses Node canvas API to draw the final image at 2x resolution for sharp text.
 */
import { createCanvas, loadImage } from "canvas"
import path from "path"
import type { ChartConfig } from "@/pkgs/isomorphic/model/news"
import {
  IMAGE_WIDTH,
  IMAGE_HEIGHT,
  SCALE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BACKGROUND_COLOR_COMPOSE,
  TEXT_COLOR,
  BRAND_COLOR,
  CENTER_DIVISOR,
  PADDING,
  HEADER_Y,
  FOOTER_Y,
  LOGO_SIZE,
  LOGO_TO_BRAND_GAP,
  TITLE_MARGIN,
  CHART_Y,
  TITLE_FONT_SIZE,
  BRAND_FONT_SIZE,
  FOOTER_FONT_SIZE,
  FONT_FAMILY,
  MIN_TITLE_LENGTH,
  TITLE_TRUNCATE_SLICE,
  LOGO_FILENAME,
} from "@/pkgs/isomorphic/charts"
import { renderChartToPng, CHART_WIDTH, CHART_HEIGHT } from "./renderChartImage"

/** Chart X position (centered based on actual rendered chart width) */
const CHART_X = (IMAGE_WIDTH - CHART_WIDTH) / CENTER_DIVISOR

interface ComposeOptions {
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
    const logoPath = path.join(process.cwd(), `public/images/${LOGO_FILENAME}`)
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
  ctx.fillStyle = BACKGROUND_COLOR_COMPOSE
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
  const logoX = PADDING
  const logoY = HEADER_Y - LOGO_SIZE / CENTER_DIVISOR

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
  const brandX = logoX + LOGO_SIZE + LOGO_TO_BRAND_GAP
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
    IMAGE_WIDTH - brandX - ctx.measureText("GPUPoet.com").width - TITLE_MARGIN
  let displayTitle = title
  while (
    ctx.measureText(displayTitle).width > maxTitleWidth &&
    displayTitle.length > MIN_TITLE_LENGTH
  ) {
    displayTitle = displayTitle.slice(0, TITLE_TRUNCATE_SLICE) + "..."
  }
  ctx.fillText(displayTitle, IMAGE_WIDTH - PADDING, HEADER_Y)
}

/**
 * Draws the footer with data attribution and date.
 */
function drawFooter(ctx: Ctx2D, date?: Date): void {
  ctx.fillStyle = TEXT_COLOR
  ctx.font = `${FOOTER_FONT_SIZE}px ${FONT_FAMILY}`
  ctx.textBaseline = "middle"

  // Attribution on the left
  ctx.textAlign = "left"
  ctx.fillText(
    "Data from GPUPoet.com • Real-time GPU price tracking",
    PADDING,
    FOOTER_Y,
  )

  // Date on the right
  if (date) {
    ctx.textAlign = "right"
    const dateStr = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    ctx.fillText(dateStr, IMAGE_WIDTH - PADDING, FOOTER_Y)
  }
}
