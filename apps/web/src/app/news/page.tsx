import { listPublishedArticles } from "@/pkgs/server/db/NewsRepository"
import { ReactNode } from "react"
import { ArticleSummary } from "./components/ArticleSummary"
import { hoursToSeconds } from "@/pkgs/isomorphic/duration"

export const revalidate = hoursToSeconds(1)

export default async function Page(): Promise<ReactNode> {
  const articles = await listPublishedArticles()

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">News Articles</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <ArticleSummary key={article.id} article={article} />
        ))}
      </div>
    </main>
  )
}
