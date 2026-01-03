/**
 * Type declarations for optional dependencies that require native compilation.
 * These packages are only available in Docker environments with the required
 * native dependencies (cairo, pango, etc).
 */

declare module "canvas" {
  export function createCanvas(width: number, height: number): Canvas
  export function loadImage(source: Buffer | string): Promise<Image>

  export interface Canvas {
    getContext(contextId: "2d"): CanvasRenderingContext2D
    toBuffer(mimeType: "image/png"): Buffer
    width: number
    height: number
  }

  export interface CanvasRenderingContext2D {
    fillStyle: string
    font: string
    textAlign: "left" | "right" | "center" | "start" | "end"
    textBaseline:
      | "top"
      | "hanging"
      | "middle"
      | "alphabetic"
      | "ideographic"
      | "bottom"
    fillRect(x: number, y: number, width: number, height: number): void
    fillText(text: string, x: number, y: number): void
    drawImage(
      image: Image | Canvas,
      dx: number,
      dy: number,
      dw?: number,
      dh?: number,
    ): void
    measureText(text: string): { width: number }
    scale(x: number, y: number): void
    save(): void
    restore(): void
    setTransform(
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
    ): void
  }

  export interface Image {
    width: number
    height: number
    src: Buffer | string
  }
}

declare module "chartjs-node-canvas" {
  import type { ChartConfiguration, Defaults } from "chart.js"

  interface ChartJSWithDefaults {
    defaults: Defaults
  }

  export interface ChartJSNodeCanvasOptions {
    width: number
    height: number
    backgroundColour?: string
    chartCallback?: (ChartJS: ChartJSWithDefaults) => void
  }

  export class ChartJSNodeCanvas {
    public constructor(options: ChartJSNodeCanvasOptions)
    public renderToBuffer(configuration: ChartConfiguration): Promise<Buffer>
    public renderToDataURL(configuration: ChartConfiguration): Promise<string>
  }
}
