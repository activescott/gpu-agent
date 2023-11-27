export async function* arrayToAsyncIterable<T>(array: T[]): AsyncIterable<T> {
  for (const item of array) {
    yield item
  }
}
