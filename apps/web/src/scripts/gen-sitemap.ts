import * as glob from "glob"
import fs from "fs"
import path from "path"
import gitLastUpdated from "./DateGitLastUpdated"
import { config } from "dotenv"

//////////////////////////////////////////////////
// NOTE: ABOVE the easiest thing to do here is avoid the @/ import aliases since next seems to resolve those as a bundler and we're not running any bundler in this script
//////////////////////////////////////////////////

const appDir = path.resolve(path.join(__dirname, "../.."))

config({ path: path.join(appDir, ".env.local") })

if (process.env.POSTGRES_PRISMA_URL === undefined) {
  throw new Error(
    "POSTGRES_PRISMA_URL is not defined. Add to .env.local or the host's environment.",
  )
}

type SiteMapItem = {
  // relative path
  path: string
  // page title
  title: string
  // lastModified is consistent w/ Next.js
  lastModified?: string | Date
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"
  priority?: number
}

type FilterOutPagePredicate = {
  // the type of page this predicate identifies
  reason: string
  // true if the page should be filtered out
  shouldExclude: (item: { path: string }) => boolean
}

const filterOutPagePredicates: FilterOutPagePredicate[] = [
  {
    reason: "redirect only page",
    shouldExclude: (item) => item.path.startsWith("/bye"),
  },
  {
    reason: "slug path",
    shouldExclude: (item) => /\[.*]/.test(item.path),
  },
  {
    reason: "junk/internal page",
    shouldExclude: (item) => item.path.startsWith("/_"),
  },
  {
    reason: "not a known static page",
    shouldExclude: (item) =>
      !item.path.startsWith("/ml/learn") &&
      !item.path.startsWith("/policy") &&
      !item.path.startsWith("/about"),
  },
]

const sitemapFile = path.join(appDir, "src/app", "sitemap.static-pages.json")

async function main() {
  // TODO: do we need tsx stuff here anymore??

  // Find all static files under the app directory
  const pageFiles = glob.sync(`${appDir}/**/page.{mdx,tsx}`, { cwd: __dirname })

  const RELATIVE_TO = `${appDir}/src/app`

  // Generate li elements for each page file
  const discoveredPages = pageFiles
    // skip the home page (we add it later)
    .filter((file) => file != `${RELATIVE_TO}/page.tsx`)
    .map((localFilePath) => {
      // get the relative path:
      const relativePath = localFilePath
        .replace(RELATIVE_TO, "")
        .replace(/\/page\.(mdx|tsx)$/, "")

      return {
        localFilePath: localFilePath,
        path: relativePath,
      } satisfies Pick<SiteMapItem, "path"> & { localFilePath: string }
    })
    .filter((item) => {
      for (const { reason, shouldExclude } of filterOutPagePredicates) {
        if (shouldExclude(item)) {
          console.log(`Excluding page '${item.path}' because it is ${reason}`)
          return false
        }
      }
      return true
    })
    .map((item) => {
      // if the file ends with an mdx extension, assume it is a markdown file and extract the first line with a heading and use it as a title (remove the markdown heading prefix):
      let title = ""
      if (item.localFilePath.endsWith(".mdx")) {
        title = parseTitleFromMdx(item.localFilePath)
      } else if (item.localFilePath.endsWith(".tsx")) {
        title = parseTitleFromTsx(item.localFilePath)
      } else {
        throw new Error(
          `Could not set title: Unknown file type for ${item.localFilePath} (${item.path})`,
        )
      }

      const lastModified = gitLastUpdated(item.localFilePath)
      console.log(
        `last modified '${lastModified}' from git for ${item.localFilePath}`,
      )
      return {
        path: item.path,
        title,
        lastModified,
      } satisfies SiteMapItem
    })

  if (discoveredPages.length === 0) {
    throw new Error("No pages found?!")
  }

  const INDENT = 2
  fs.writeFileSync(
    sitemapFile,
    JSON.stringify({ data: discoveredPages }, null, INDENT),
  )
}

function parseTitleFromMdx(file: string): string {
  return (
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .find((line) => line.startsWith("#"))
      ?.replace(/^#+\s*/, "") || path.dirname(file)
  )
}

function parseTitleFromTsx(file: string): string {
  const contents = fs.readFileSync(file, "utf8")

  const metadataRegex =
    /export const metadata:\s*Metadata\s*=\s*{\s*title:\s*"([^"]+)"/
  const match = metadataRegex.exec(contents)

  if (match) {
    return match[1]
  } else {
    throw new Error(`Could not find metadata in ${file}`)
  }
}

main()
  .then(() => {
    console.log(`Wrote ${sitemapFile}`)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
