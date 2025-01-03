export function divideSafe(
  numerator: number,
  denominator: number | null | undefined,
): number {
  return denominator ? numerator / denominator : Number.POSITIVE_INFINITY
}
