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

  return (
    <main className="max-w-4xl mx-auto p-6">
      {/* Market Reports Section */}
      {marketReports.length > 0 && (
        <section>
          <h1 className="mt-4">Market Reports</h1>
          {marketReports.map((report) => (
            <MarketReportSummary key={report.slug} report={report} />
          ))}
        </section>
      )}

      {/* News Articles Section */}
      <section>
        <h1 className="mt-5">Other News</h1>
        {articles.map((article) => (
          <ArticleSummary key={article.id} article={article} />
        ))}
      </section>
    </main>
  )
}
