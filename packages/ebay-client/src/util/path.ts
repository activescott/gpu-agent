import path from "path"

/** Use it like `dirname(import.meta)` */
export function dirname(meta: { url: string }): string {
  return path.dirname(new URL(meta.url).pathname)
}
