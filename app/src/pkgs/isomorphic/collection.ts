export async function* arrayToAsyncIterable<T>(array: T[]): AsyncIterable<T> {
  for (const item of array) {
    yield item
  }
}

export function* flattenIterables<TItem>(
  iterables: Iterable<TItem>[],
): Iterable<TItem> {
  for (const iterable of iterables) {
    yield* iterable
  }
}

type CompareFn<T> = (a: T, b: T) => number

export function composeComparers<T>(
  ...comparers: CompareFn<T>[]
): CompareFn<T> {
  return (a: T, b: T) => {
    for (const comparer of comparers) {
      const result = comparer(a, b)
      if (result !== 0) return result
    }
    return 0
  }
}
