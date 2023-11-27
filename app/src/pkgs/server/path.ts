import path from "path"

/**
 * Returns the directory name for the specified file's import.meta.
 * @param importMetaUrl Should be the import.meta value per https://nodejs.org/api/esm.html#importmeta and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta
 * @returns
 */
export function dirname(importMeta: ImportMeta): string {
  if (!Reflect.has(importMeta, "url")) {
    throw new Error(
      "Invalid import meta. Note that next.js doesn't support import.meta.url. Use __dirname 🤷‍♂️",
    )
  }
  const u = new URL(importMeta.url)
  return path.dirname(u.pathname)
}
