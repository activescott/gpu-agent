#!/usr/bin/env -S npx ts-node-esm

import * as glob from "glob"
import fs from "fs"
import path from "path"

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const appDir = path.join(__dirname, "../app/src/app")
const sitemapFile = path.join(__dirname, "../app/src/app/sitemap.json")

// Find all page.tsx files under the app directory
const pageFiles = glob.sync(`${appDir}/**/page.mdx`, { cwd: __dirname })

// Generate li elements for each page file
const items = pageFiles
  .filter((file) => file != `${appDir}/page.tsx`)
  .map((file) => {
    const relativePath = file
      .replace(`${appDir}`, "")
      .replace(/\/page\.mdx$/, "")
    return {
      path: relativePath,
    }
  })

fs.writeFileSync(sitemapFile, JSON.stringify({ data: items }, null, 2))
