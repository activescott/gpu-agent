import { divideSafe } from "./math"
import { GpuSpecKey, GpuSpecs } from "./model/specs"
import { GpuMetricKey, GpuMetrics } from "./model/metrics"

export const dollarsPerSpec = (
  gpu: GpuSpecs,
  dollars: number | null | undefined,
  spec: GpuSpecKey,
): number => divideSafe(dollars, gpu[spec])

export const dollarsPerMetric = (
  gpu: GpuMetrics,
  dollars: number | null | undefined,
  metric: GpuMetricKey,
): number => divideSafe(dollars, gpu[metric])
