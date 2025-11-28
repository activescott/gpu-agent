import { listPublishedArticles } from "@/pkgs/server/db/NewsRepository"
import { ReactNode } from "react"
import { ArticleSummary } from "./components/ArticleSummary"
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
