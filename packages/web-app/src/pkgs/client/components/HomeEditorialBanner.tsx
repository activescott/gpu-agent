import Link from "next/link"
import { BootstrapIcon } from "./BootstrapIcon"
import type { NewsItem } from "./NewsArticlePair"

interface HomeEditorialReport {
  slug: string
  title: string
  description: string
  publishedAt: Date
}

/** Above-the-fold home page block featuring the latest GPU market report and (on desktop) the two newest news articles. */
export function HomeEditorialBanner({
  report,
  latestNews,
}: {
  report: HomeEditorialReport | null
  latestNews: NewsItem[]
}) {
  if (!report) return null

  const monthYear = report.publishedAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  })

  return (
    <section
      aria-label="Latest market report"
      className="my-4 p-4 rounded-3 shadow bg-body-tertiary"
    >
      <div className="d-flex flex-column flex-md-row gap-4">
        <div className="flex-fill">
          <div className="text-accent fw-semibold text-uppercase small mb-2">
            <span className="me-2">
              <BootstrapIcon icon="bar-chart-line-fill" size="xs" />
            </span>
            {monthYear} GPU Market Report
          </div>
          <h2 className="h4 mb-2">
            <Link
              href={`/gpu/market-report/${report.slug}`}
              className="text-decoration-none"
            >
              {report.title}
            </Link>
          </h2>
          <p className="mb-3">{report.description}</p>
          <Link
            href={`/gpu/market-report/${report.slug}`}
            className="fw-semibold"
          >
            Read the {monthYear} Market Report →
          </Link>
        </div>

        {latestNews.length > 0 && (
          <aside
            aria-label="Latest news"
            className="flex-shrink-0 d-none d-md-block"
            style={{ minWidth: "260px", maxWidth: "320px" }}
          >
            <div className="fw-semibold text-uppercase small text-body-secondary mb-2">
              <span className="me-2">
                <BootstrapIcon icon="newspaper" size="xs" />
              </span>
              Latest News
            </div>
            <ul className="list-unstyled mb-2">
              {latestNews.map((article) => (
                <li key={article.id} className="mb-2">
                  <Link
                    href={article.href ?? `/news/${article.slug}`}
                    className="text-decoration-none fw-semibold d-block"
                  >
                    {article.title}
                  </Link>
                  <div className="text-body-secondary small">
                    {article.publishedAt.toLocaleDateString("en-US", {
                      timeZone: "America/Los_Angeles",
                    })}
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/news" className="small">
              All news →
            </Link>
          </aside>
        )}
      </div>
    </section>
  )
}
