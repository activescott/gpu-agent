import { NewsArticle } from "@/pkgs/isomorphic/model/news"
import { ReactNode } from "react"

interface ArticleSummaryProps {
  article: NewsArticle
}

export function ArticleSummary({ article }: ArticleSummaryProps): ReactNode {
  return (
    <article className="border-b pb-6">
      <h2 className="text-2xl font-semibold">
        <a
          href={`/news/${article.slug}`}
          className="text-blue-600 hover:underline"
        >
          {article.title}
        </a>
      </h2>
      <div className="mt-2 text-sm text-gray-600">
        <span>By {article.authorFullName}</span>
        {article.publishedAt && (
          <span> • {formatDate(article.publishedAt)}</span>
        )}
      </div>
      {article.tags.length > 0 && (
        <div className="mt-2 flex gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {tag}
            </span>
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
