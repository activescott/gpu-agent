"use client"
import { NewsArticle } from "@/pkgs/isomorphic/model"
import { ReactNode } from "react"
import { BootstrapIcon, BootstrapIconName } from "./BootstrapIcon"
import { useFeatureFlagVariantKey } from "posthog-js/react"
import { TipCard } from "./TipCard"
import Link from "next/link"

// NOTE: used on home page - very specific to a need there.
export function NewsArticlePair({
  articles,
  startIndex,
}: {
  articles: NewsArticle[]
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

  // You can also test your code by overriding the feature flag:
  /*
  const posthog = usePostHog()
  posthog.featureFlags.override({
    "news-on-home-page-affects-affiliate-redirects": "test",
  })
  */

  // NOTE: This hook can only be used in a client component or it fails with a weird error about createContext.
  const variant = useFeatureFlagVariantKey(
    "news-on-home-page-affects-affiliate-redirects",
  )

  if (variant !== "test") {
    return <></>
  }

  return (
    <div className="d-flex flex-column flex-md-row justify-content-evenly my-4 gap-3">
      {articles.map((article, index) => (
        <TipCard key={article.id} icon={selectNewsIcon(index)}>
          <div className="d-flex flex-column">
            <Link
              href={`/news/${article.slug}`}
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
