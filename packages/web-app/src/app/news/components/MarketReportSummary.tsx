import type { MarketReportMetadata } from "@/app/gpu/market-report/reports"
import { ReactNode } from "react"
import { ArticleTag } from "./ArticleTag"

interface MarketReportSummaryProps {
  report: MarketReportMetadata
}

export function MarketReportSummary({
  report,
}: MarketReportSummaryProps): ReactNode {
  return (
    <article className="p-6 mt-2 mb-5">
      <h3>
        <a href={`/gpu/market-report/${report.slug}`}>{report.title}</a>
      </h3>
      <div className="mt-2 text-muted">
        <span>By {report.author}</span>
        <span> - {formatDate(report.publishedAt)}</span>
      </div>
      <p className="mt-2">{report.description}</p>
      {report.tags.length > 0 && (
        <div className="mt-2 flex gap-2">
          {report.tags.map((tag) => (
            <ArticleTag tag={tag} key={tag} />
          ))}
        </div>
      )}
    </article>
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
