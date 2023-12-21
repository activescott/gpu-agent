import * as glob from "glob"
import fs from "fs"
import path from "path"
import gitLastUpdated from "./DateGitLastUpdated"
import { PrismaClient, gpu } from "@prisma/client"
import {
  listPerformanceSlugs,
  mapSlugToPageTitle,
} from "../app/ml/shop/gpu/performance/slugs"
import {
  gpuRankingCanonicalPath,
  gpuRankingTitle,
  listGpuRankingSlugs,
} from "../app/ml/learn/gpu/ranking/slugs"

//////////////////////////////////////////////////
// NOTE: ABOVE the easiest thing to do here is avoid the @/ import aliases since next seems to resolve those as a bundler and we're not running any bundler in this script
//////////////////////////////////////////////////

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

//const __dirname = path.dirname(new URL(import.meta.url).pathname)
const appDir = path.join(__dirname, "../app")
const sitemapFile = path.join(appDir, "sitemap.json")

async function main() {
  // Find all page.tsx files under the app directory
  const pageFiles = glob.sync(`${appDir}/**/page.{mdx,tsx}`, { cwd: __dirname })

  const SLUG_IN_PATH_REGEX = /\[.*]/

  // Generate li elements for each page file
  const discoveredPages = pageFiles
    .filter((file) => file != `${appDir}/page.tsx`)
    .map((file) => {
      // get the relative path:
      const relativePath = file
        .replace(`${appDir}`, "")
        .replace(/\/page\.(mdx|tsx)$/, "")

      // if the file ends with an mdx extension, assume it is a markdown file and extract the first line with a heading and use it as a title (remove the markdown heading prefix):
      let title = ""
      if (file.endsWith(".mdx")) {
        title = parseTitleFromMdx(file)
      } else if (file.endsWith(".tsx")) {
        title = parseTitleFromTsx(file)
      } else {
        path.basename(file)
      }

      const lastModified = gitLastUpdated(file)

      return {
        path: relativePath,
        title,
        lastModified,
      } satisfies SiteMapItem
    })
    // remove any dirs that begin with _
    .filter((item) => !item.path.startsWith("/_"))
    // remove /bye which is just an affiliate tracking redirect
    .filter((item) => !item.path.startsWith("/bye"))
    // remove slugs:
    .filter((item) => !SLUG_IN_PATH_REGEX.test(item.path))
    // skip the /ml/learn/gpu/**/* pages because we'll generate them from the gpus in the DB below:
    .filter((item) => !item.path.startsWith("/ml/learn/gpu"))
    // /ml/shop/gpu/page.tsx has dynamic generated metadata. So we add it manually below
    .filter((item) => item.path !== "/ml/shop/gpu")

  const prisma = new PrismaClient()
  const gpuList = await prisma.gpu.findMany({
    where: {
      NOT: { name: "test-gpu" },
    },
  })
  const collator = new Intl.Collator("en")
  const comparePagesByPath = (a: SiteMapItem, b: SiteMapItem) =>
    collator.compare(a.path, b.path)
  // /ml/learn/gpu/ gpu pages are generated dynamically in app/src/app/ml/shop/gpu/[gpuSlug]/page.tsx
  const learnGpuPages = gpuList
    .map(({ name, label, updatedAt }: gpu) => ({
      path: `/ml/learn/gpu/${name}`,
      title: `${label} Specifications for Machine Learning`,
      lastModified: updatedAt,
    }))
    .sort(comparePagesByPath)
  // this page is a static page in that directory that we need to override to get the right title
  const learnGpuSpecsPage = {
    path: "/ml/learn/gpu/specifications",
    title: "GPU Performance Specifications for Machine Learning",
  }
  const performanceSlugs = listPerformanceSlugs()
  const shopGpuPerformancePages = performanceSlugs
    .map((slug) => ({
      path: `/ml/shop/gpu/performance/${slug}`,
      title: mapSlugToPageTitle(slug),
    }))
    .sort(comparePagesByPath)

  const gpuRankingPages = listGpuRankingSlugs()
    .map((slug) => ({
      path: "/" + gpuRankingCanonicalPath(slug),
      title: gpuRankingTitle(slug),
    }))
    .sort(comparePagesByPath)

  const shopGpuPages = gpuList
    .map(({ name, label }: gpu) => ({
      path: `/ml/shop/gpu/${name}`,
      title: `Price Compare ${label} GPUs`,
    }))
    .sort(comparePagesByPath)
  const priorityShopPages = [
    {
      path: `/ml/shop/gpu`,
      title: `Price Compare GPUs for Machine Learning`,
    },
  ]

  const items = [
    ...priorityShopPages,
    ...shopGpuPerformancePages,
    ...shopGpuPages,
    ...gpuRankingPages,
    learnGpuSpecsPage,
    ...learnGpuPages,
    ...discoveredPages,
  ]
  const INDENT = 2
  fs.writeFileSync(sitemapFile, JSON.stringify({ data: items }, null, INDENT))
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
  }
  return path.basename(file)
}

main()
  .then(() => {
    console.log(`Wrote ${sitemapFile}`)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
