import { listPublishedArticles } from "@/pkgs/server/db/NewsRepository"
import { ReactNode } from "react"
import { ArticleSummary } from "./components/ArticleSummary"
import { hoursToSeconds } from "@/pkgs/isomorphic/duration"
import { maxLength } from "@/pkgs/isomorphic/string"
import { Metadata } from "next"

export const revalidate = hoursToSeconds(1)

const METADATA_MAX_TITLE_LENGTH = 70
const METADATA_MAX_DESCRIPTION_LENGTH = 160

export const metadata: Metadata = {
  title: "News about finding the best GPU for your Money - CoinPoet.com",
  description: maxLength(
    METADATA_MAX_DESCRIPTION_LENGTH,
  )`News and updates from CoinPoet.com: Find the best GPU for your money. GPU Price/Performance Rankings on specifications such as Tensor Cores, memory bandwidth, FP32/FP16 FLOPs, and more.`,
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
