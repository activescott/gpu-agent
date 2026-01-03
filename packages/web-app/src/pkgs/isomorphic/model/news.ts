import { z } from "zod"

const NewsStatus = z.enum(["DRAFT", "PUBLISHED"])
type NewsStatus = z.infer<typeof NewsStatus>

// Color options for charts
const ChartColorSchema = z.enum(["danger", "success", "warning", "primary"])

// Bar chart data item (for bar and diverging charts)
const BarChartDataItemSchema = z.object({
  label: z.string(),
  value: z.number(),
  sublabel: z.string().optional(),
  color: ChartColorSchema.optional(),
})

// Line chart data point
const LineChartPointSchema = z.object({
  x: z.string(), // e.g., "Aug 2025" or "2025-08"
  y: z.number(),
})

// Line chart series (one line on the chart)
const LineChartSeriesSchema = z.object({
  label: z.string(),
  color: ChartColorSchema.optional(),
  data: z.array(LineChartPointSchema),
})

// Bar chart configuration
const BarChartConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  chartType: z.literal("bar"),
  unit: z.string().optional(),
  data: z.array(BarChartDataItemSchema),
})

// Diverging bar chart configuration (for positive/negative values)
const DivergingBarChartConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  chartType: z.literal("diverging"),
  unit: z.string().optional(),
  data: z.array(BarChartDataItemSchema),
})

// Line chart configuration (for time-series data)
const LineChartConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  chartType: z.literal("line"),
  xAxisLabel: z.string().optional(),
  yAxisLabel: z.string().optional(),
  unit: z.string().optional(), // e.g., "$" for currency
  series: z.array(LineChartSeriesSchema),
})

// Union of all chart types using discriminated union on chartType
const ChartConfigSchema = z.discriminatedUnion("chartType", [
  BarChartConfigSchema,
  DivergingBarChartConfigSchema,
  LineChartConfigSchema,
])

// ChartData now contains an array of dynamic charts
const ChartDataSchema = z.object({
  charts: z.array(ChartConfigSchema),
})

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
export type ChartData = z.infer<typeof ChartDataSchema>
export type ChartConfig = z.infer<typeof ChartConfigSchema>
export type BarChartConfig = z.infer<typeof BarChartConfigSchema>
export type DivergingBarChartConfig = z.infer<
  typeof DivergingBarChartConfigSchema
>
export type LineChartConfig = z.infer<typeof LineChartConfigSchema>
export type BarChartDataItem = z.infer<typeof BarChartDataItemSchema>
export type LineChartPoint = z.infer<typeof LineChartPointSchema>
export type LineChartSeries = z.infer<typeof LineChartSeriesSchema>

// Re-export the schemas for use in other modules
export {
  ChartDataSchema,
  ChartConfigSchema,
  BarChartDataItemSchema,
  LineChartPointSchema,
  LineChartSeriesSchema,
}
