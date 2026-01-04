/**
 * Client-side utility to download a chart canvas with GPUPoet branding.
 * Adds header (logo, brand, title), footer, and watermark to match
 * the server-side composeChartImage output.
 *
 * Uses shared constants from @/pkgs/isomorphic/charts to stay DRY with
 * the server-side implementation.
 */
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
  LOGO_PATH,
} from "@/pkgs/isomorphic/charts"

/**
 * Client-specific chart dimensions.
 * NOTE: These differ from server-side renderChartImage.ts dimensions (1104x400)
 * because the client fits captured canvases into a target area, while server
 * renders charts at exact dimensions.
 */
const CHART_WIDTH = 1000
const CHART_HEIGHT = 450
const CHART_X = (IMAGE_WIDTH - CHART_WIDTH) / CENTER_DIVISOR

/** Cached logo image */
let cachedLogo: HTMLImageElement | null = null

/**
 * Loads the logo image (cached for reuse).
 */
async function getLogoImage(): Promise<HTMLImageElement> {
  if (cachedLogo) return cachedLogo

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener("load", () => {
      cachedLogo = img
      resolve(img)
    })
    img.addEventListener("error", reject)
    img.src = LOGO_PATH
  })
}

export interface DownloadChartOptions {
  /** Chart title displayed in header */
  title: string
  /** Filename for download (without extension) */
  filename: string
  /** Optional date for footer */
  date?: Date
}

/**
 * Downloads a chart canvas with full GPUPoet branding.
 * Creates a composed image with header, footer, and the chart centered.
 *
 * @param sourceCanvas - The Chart.js canvas element to capture
 * @param options - Download options (title, filename, date)
 */
export async function downloadChartWithBranding(
  sourceCanvas: HTMLCanvasElement,
  options: DownloadChartOptions,
): Promise<void> {
  const { title, filename, date } = options

  // Load logo
  const logoImage = await getLogoImage()

  // Create the final canvas at 2x resolution
  const canvas = document.createElement("canvas")
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Scale all drawing operations
  ctx.scale(SCALE, SCALE)

  // Fill background
  ctx.fillStyle = BACKGROUND_COLOR_COMPOSE
  ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT)

  // Draw header
  drawHeader(ctx, logoImage, title)

  // Draw the chart (scaled to fit the area)
  const chartAspect = sourceCanvas.width / sourceCanvas.height
  const targetAspect = CHART_WIDTH / CHART_HEIGHT
  let drawWidth = CHART_WIDTH
  let drawHeight = CHART_HEIGHT
  let drawX = CHART_X
  let drawY = CHART_Y

  if (chartAspect > targetAspect) {
    // Chart is wider - fit to width
    drawHeight = CHART_WIDTH / chartAspect
    drawY = CHART_Y + (CHART_HEIGHT - drawHeight) / CENTER_DIVISOR
  } else {
    // Chart is taller - fit to height
    drawWidth = CHART_HEIGHT * chartAspect
    drawX = CHART_X + (CHART_WIDTH - drawWidth) / CENTER_DIVISOR
  }

  ctx.drawImage(sourceCanvas, drawX, drawY, drawWidth, drawHeight)

  // Draw footer
  drawFooter(ctx, date)

  // Download
  const link = document.createElement("a")
  link.download = `${filename}.png`
  link.href = canvas.toDataURL("image/png")
  link.click()
}

/**
 * Draws the header with logo, brand name, and title.
 */
function drawHeader(
  ctx: CanvasRenderingContext2D,
  logoImage: HTMLImageElement,
  title: string,
): void {
  const logoX = PADDING
  const logoY = HEADER_Y - LOGO_SIZE / CENTER_DIVISOR

  // Draw logo
  ctx.drawImage(logoImage, logoX, logoY, LOGO_SIZE, LOGO_SIZE)

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
function drawFooter(ctx: CanvasRenderingContext2D, date?: Date): void {
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
