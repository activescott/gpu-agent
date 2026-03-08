import { listPublishedArticles } from "@/pkgs/server/db/NewsRepository"
import { listMarketReports } from "@/app/gpu/market-report/reports"
import { ReactNode } from "react"
import { ArticleSummary } from "./components/ArticleSummary"
import { MarketReportSummary } from "./components/MarketReportSummary"
import { maxLength } from "@/pkgs/isomorphic/string"
import { Metadata } from "next"

export const revalidate = 3600

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

const METADATA_MAX_TITLE_LENGTH = 70
const METADATA_MAX_DESCRIPTION_LENGTH = 160

export const metadata: Metadata = {
  title: "News about finding the best GPU for your Money - GPUPoet.com",
  description: maxLength(
    METADATA_MAX_DESCRIPTION_LENGTH,
  )`News and updates from GPUPoet.com. Where you find the best GPU for your money. GPU Price/Performance Rankings on specifications and more.`,
}

if (
  typeof metadata.title !== "string" ||
  metadata.title.length > METADATA_MAX_TITLE_LENGTH
) {
  throw new Error(`metadata.title is too long`)
}

export default async function Page(): Promise<ReactNode> {
  const articles = await listPublishedArticles()
  const marketReports = listMarketReports()

  // Merge market reports and news articles into a single list sorted by publishedAt
  const allItems: Array<
    | { type: "article"; item: (typeof articles)[number] }
    | { type: "report"; item: (typeof marketReports)[number] }
  > = [
    ...articles
      .filter((a) => a.publishedAt !== null)
      .map((a) => ({ type: "article" as const, item: a })),
    ...marketReports.map((r) => ({ type: "report" as const, item: r })),
  ]
  allItems.sort(
    (a, b) =>
      new Date(b.item.publishedAt!).getTime() -
      new Date(a.item.publishedAt!).getTime(),
  )

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="mt-4">News</h1>
      {allItems.map((entry) =>
        entry.type === "report" ? (
          <MarketReportSummary key={entry.item.slug} report={entry.item} />
        ) : (
          <ArticleSummary key={entry.item.id} article={entry.item} />
        ),
      )}
    </main>
  )
}
