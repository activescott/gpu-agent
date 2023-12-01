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
