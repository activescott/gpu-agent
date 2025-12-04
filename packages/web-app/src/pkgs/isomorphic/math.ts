export function divideSafe(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
): number {
  if (!numerator || !denominator) {
    return Number.POSITIVE_INFINITY
  }
  return numerator / denominator
}
