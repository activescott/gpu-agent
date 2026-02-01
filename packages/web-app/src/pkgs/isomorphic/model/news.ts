import { z } from "zod"

const NewsStatus = z.enum(["DRAFT", "PUBLISHED"])
type NewsStatus = z.infer<typeof NewsStatus>

// Chart types (plain TypeScript — not used for runtime validation)
type ChartColor = "danger" | "success" | "warning" | "primary"

interface BarChartDataItem {
  label: string
  value: number
  sublabel?: string
  color?: ChartColor
}

interface LineChartPoint {
  x: string // e.g., "Aug 2025" or "2025-08"
  y: number
}

export interface LineChartSeries {
  label: string
  color?: ChartColor
  data: LineChartPoint[]
}

export interface BarChartConfig {
  id: string
  title: string
  chartType: "bar"
  unit?: string
  data: BarChartDataItem[]
}

export interface DivergingBarChartConfig {
  id: string
  title: string
  chartType: "diverging"
  unit?: string
  data: BarChartDataItem[]
}

export interface LineChartConfig {
  id: string
  title: string
  chartType: "line"
  xAxisLabel?: string
  yAxisLabel?: string
  unit?: string
  series: LineChartSeries[]
}

export type ChartConfig =
  | BarChartConfig
  | DivergingBarChartConfig
  | LineChartConfig

export const NewsArticleSchema = z.object({
  id: z.string().cuid2(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  status: NewsStatus.default("DRAFT"),
  tags: z.array(z.string()),
  authorFullName: z.string(),
  createdAt: z.union([z.date(), z.string()]).pipe(z.coerce.date()),
  updatedAt: z.union([z.date(), z.string()]).pipe(z.coerce.date()),
  publishedAt: z
    .union([z.date(), z.string(), z.null()])
    .pipe(z.coerce.date().nullable()),
})

export type NewsArticle = z.infer<typeof NewsArticleSchema>
