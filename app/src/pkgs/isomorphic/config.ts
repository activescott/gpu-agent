// keys should be from the .env.* files
// NOTE: you must use the dot-syntax on process.env. or the keys won't be there (at least on the client)

export const ISOMORPHIC_CONFIG = {
  NEXT_PUBLIC_DOMAIN: (): string =>
    returnOrThrow("NEXT_PUBLIC_DOMAIN", process.env.NEXT_PUBLIC_DOMAIN),
}

const returnOrThrow = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing environment variable ${key}`)
  }
  return value
}
