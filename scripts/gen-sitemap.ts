#!/usr/bin/env -S npx ts-node-esm

import * as glob from "glob"
import fs from "fs"
import path from "path"

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const appDir = path.join(__dirname, "../app/src/app")
const sitemapFile = path.join(__dirname, "../app/src/app/sitemap.json")

// Find all page.tsx files under the app directory
const pageFiles = glob.sync(`${appDir}/**/page.{mdx,tsx}`, { cwd: __dirname })

// Generate li elements for each page file
const items = pageFiles
  .filter((file) => file != `${appDir}/page.tsx`)
  .map((file) => {
    // get the relative path:
    const relativePath = file
      .replace(`${appDir}`, "")
      .replace(/\/page\.(mdx|tsx)$/, "")

    // if the file ends with an mdx extension, assume it is a markdown file and extract the first line with a heading and use it as a title (remove the markdown heading prefix):
    const title = file.endsWith(".mdx")
      ? parseTitleFromMdx(file)
      : file.endsWith(".tsx")
      ? parseTitleFromTsx(file)
      : path.basename(file)

    return {
      path: relativePath,
      title,
    }
  })
  .filter((item) => !item.path.startsWith("/z-hide-verify-impact"))
  .filter((item) => !item.path.startsWith("/_junk"))

fs.writeFileSync(sitemapFile, JSON.stringify({ data: items }, null, 2))

function parseTitleFromMdx(file: string) {
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .find((line) => line.startsWith("#"))
    ?.replace(/^#+\s*/, "")
}

function parseTitleFromTsx(file: string): string {
  const contents = fs.readFileSync(file, "utf8")

  const metadataRegex =
    /export const metadata:\s*Metadata\s*=\s*\{[\s\n]*title:\s*"([^"]+)"/
  const match = metadataRegex.exec(contents)

  if (match) {
    return match[1]
  }
  return path.basename(file)
}
