import { NewsArticle } from "@/pkgs/isomorphic/model/news"
import { PrismaClientWithinTransaction, prismaSingleton } from "./db"
import { Simplify } from "type-fest"

type NewsArticlePublished = Simplify<
  {
    status: "PUBLISHED"
    publishedAt: Date
  } & Omit<NewsArticle, "status" | "publishedAt">
>

export async function listPublishedArticles(
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<NewsArticlePublished[]> {
  const articles = await prisma.newsArticle.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
  })
  return articles as NewsArticlePublished[]
}

export async function getPublishedArticleBySlug(
  slug: string,
  prisma: PrismaClientWithinTransaction = prismaSingleton,
): Promise<NewsArticle | null> {
  const article = await prisma.newsArticle.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { not: null },
    },
  })
  return article
}
