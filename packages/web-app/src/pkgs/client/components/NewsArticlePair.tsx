import { ReactNode } from "react"
import { BootstrapIcon, BootstrapIconName } from "./BootstrapIcon"
import { TipCard } from "./TipCard"
import Link from "next/link"

/** Lightweight item type for news-style cards on the home page. */
export interface NewsItem {
  id: string
  title: string
  publishedAt: Date
  /** Link href. Defaults to /news/{slug} if not provided. */
  href?: string
  slug: string
}

// NOTE: used on home page - very specific to a need there.
export function NewsArticlePair({
  articles,
  startIndex,
}: {
  articles: NewsItem[]
  startIndex: number
}): ReactNode {
  const newsIcons: BootstrapIconName[] = [
    "ear",
    "megaphone",
    "star",
    "info-circle",
  ]
  const selectNewsIcon = (index: number) => {
    let iconIndex = startIndex + index
    iconIndex =
      iconIndex < newsIcons.length
        ? iconIndex
        : iconIndex % (newsIcons.length - 1)
    return newsIcons[iconIndex]
  }

  return (
    <div className="d-flex flex-column flex-md-row justify-content-evenly my-4 gap-3">
      {articles.map((article, index) => (
        <TipCard key={article.id} icon={selectNewsIcon(index)}>
          <div className="d-flex flex-column">
            <Link
              href={article.href ?? `/news/${article.slug}`}
              className="text-decoration-none fw-semibold mb-1"
            >
              {article.title}
            </Link>
            <div className="text-body-secondary small">
              <span className="me-1">
                <BootstrapIcon icon="calendar3" size="xs" />
              </span>
              {article.publishedAt!.toLocaleDateString()}
            </div>
          </div>
        </TipCard>
      ))}
    </div>
  )
}
