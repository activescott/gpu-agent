export function fetchImpl(
  input: NodeJS.fetch.RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  //TODO: get https://www.npmjs.com/package/@vercel/fetch or something working here to handle retries and rate limiting properly
  return fetch(input, init)
}
