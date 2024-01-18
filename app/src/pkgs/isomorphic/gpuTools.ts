import { divideSafe } from "./math"
import { GpuSpecKey, GpuSpecs } from "./model/specs"

export const dollarsPerSpec = (
  gpu: GpuSpecs,
  dollars: number,
  spec: GpuSpecKey,
): number => divideSafe(dollars, gpu[spec])
