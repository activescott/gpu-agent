/**
 * Shared constants for chart image composition.
 * Used by both server-side (composeChartImage) and client-side (downloadChartWithBranding).
 *
 * NOTE: Chart dimensions (CHART_WIDTH, CHART_HEIGHT, CHART_X, CHART_Y) are NOT shared
 * because the server uses the actual rendered chart size from renderChartImage.ts,
 * while the client fits captured canvases into a target area.
 */

/** Final image dimensions (standard OG image size) */
export const IMAGE_WIDTH = 1200
export const IMAGE_HEIGHT = 630

/** Device pixel ratio for high-resolution rendering (2x for retina) */
export const SCALE = 2

/** Scaled dimensions for the canvas */
export const CANVAS_WIDTH = IMAGE_WIDTH * SCALE
export const CANVAS_HEIGHT = IMAGE_HEIGHT * SCALE

/** Colors */
export const BACKGROUND_COLOR_COMPOSE = "#ffffff"
export const TEXT_COLOR = "#374151"
export const BRAND_COLOR = "#d11363" // GPUPoet brand pink

/** Layout constants */
export const CENTER_DIVISOR = 2
export const PADDING = 48
export const HEADER_Y = 50
export const FOOTER_Y = 580
export const LOGO_SIZE = 48
export const LOGO_TO_BRAND_GAP = 12
export const TITLE_MARGIN = 100
export const CHART_Y = 100

/** Font settings */
export const TITLE_FONT_SIZE = 32
export const BRAND_FONT_SIZE = 28
export const FOOTER_FONT_SIZE = 18
export const FONT_FAMILY = "'Helvetica Neue', Arial, sans-serif"

/** Title truncation */
export const MIN_TITLE_LENGTH = 10
export const TITLE_TRUNCATE_SLICE = -4

/** Logo path (relative to public folder) */
export const LOGO_FILENAME = "coinpoet-card-128.png"
export const LOGO_PATH = `/images/${LOGO_FILENAME}`
