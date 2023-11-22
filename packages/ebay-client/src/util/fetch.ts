export function fetchImpl(
  input: NodeJS.fetch.RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, init)
}
