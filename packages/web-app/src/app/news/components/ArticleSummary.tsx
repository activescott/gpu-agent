import { NewsArticle } from "@/pkgs/isomorphic/model/news"
import { ReactNode } from "react"
import { ArticleTag } from "./ArticleTag"

interface ArticleSummaryProps {
  article: NewsArticle
}

export function ArticleSummary({ article }: ArticleSummaryProps): ReactNode {
  return (
    <article className="p-6 mt-2 mb-5">
      <h2>
        <a href={`/news/${article.slug}`}>{article.title}</a>
      </h2>
      <div className="mt-2 text-muted">
        <span>By {article.authorFullName}</span>
        {article.publishedAt && (
          <span> • {formatDate(article.publishedAt)}</span>
        )}
      </div>
      {article.tags.length > 0 && (
        <div className="mt-2 flex gap-2">
          {article.tags.map((tag) => (
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
