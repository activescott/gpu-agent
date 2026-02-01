/**
 * Shared layout components for market reports.
 */
import Link from "next/link"
import type { ReactNode } from "react"
import type { MarketReportMetadata } from "../reports"
import { ArticleTag } from "@/app/news/components/ArticleTag"

interface ReportLayoutProps {
  metadata: MarketReportMetadata
  children: ReactNode
}

/**
 * Main layout wrapper for market reports.
 */
export function ReportLayout({
  metadata,
  children,
}: ReportLayoutProps): ReactNode {
  return (
    <>
      <Breadcrumbs title={metadata.title} />
      <div className="container mt-4">
        <article className="blog-post">
          <ReportHeader metadata={metadata} />

          {metadata.tags && metadata.tags.length > 0 && (
            <div className="mb-4">
              {metadata.tags.map((tag) => (
                <ArticleTag tag={tag} key={tag} />
              ))}
            </div>
          )}

          {children}

          <ReportFooter />
        </article>
      </div>
    </>
  )
}

function Breadcrumbs({ title }: { title: string }): ReactNode {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/">Home</Link>
        </li>
        <li className="breadcrumb-item">
          <Link href="/gpu/price-compare">GPUs</Link>
        </li>
        <li className="breadcrumb-item">
          <Link href="/news">News</Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          {title}
        </li>
      </ol>
    </nav>
  )
}

function ReportHeader({
  metadata,
}: {
  metadata: MarketReportMetadata
}): ReactNode {
  return (
    <header className="mb-4">
      <h1 className="display-5 fw-bold mb-3">{metadata.title}</h1>
      <div className="text-muted">
        <span>By {metadata.author}</span>
        {metadata.publishedAt && (
          <span> - {metadata.publishedAt.toLocaleDateString()}</span>
        )}
      </div>
    </header>
  )
}

function ReportFooter(): ReactNode {
  return (
    <div className="mt-5 pt-4 border-top">
      <div className="row">
        <div className="col-md-6">
          <h5>Want Current Prices?</h5>
          <p className="text-muted">
            This report reflects a snapshot in time. For live GPU pricing and
            rankings, visit our main GPU pages.
          </p>
          <Link href="/gpu/price-compare" className="btn btn-primary">
            View Live GPU Prices
          </Link>
        </div>
        <div className="col-md-6">
          <h5>Compare GPUs</h5>
          <p className="text-muted">
            Use our comparison tool to see how different GPUs stack up in
            performance and value.
          </p>
          <Link href="/gpu/compare" className="btn btn-outline-primary">
            Compare GPUs
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Section wrapper for chart content.
 */
export function ChartSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}): ReactNode {
  return (
    <section className="mb-5">
      <h2 className="h4 mb-3 text-primary">{title}</h2>
      {children}
    </section>
  )
}
