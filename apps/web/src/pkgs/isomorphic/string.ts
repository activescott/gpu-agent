/**
 * Verifies that the string does not exceed the specified maximum length.
 * @param maxLen the maximum length of the string
 * @returns the string
 */
export function maxLength(maxLen: number) {
  return function (strings: TemplateStringsArray, ...values: unknown[]) {
    const result = String.raw({ raw: strings }, ...values)
    if (result.length > maxLen) {
      throw new Error(`String exceeds maximum length of ${maxLen} characters`)
    }
    return result
  }
}
