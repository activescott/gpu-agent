import type { Metadata } from "next"
import { notFound } from "next/navigation"
import MarkdownContent from "@/pkgs/client/components/MarkdownContent"
import {
  getPublishedArticleBySlug,
} from "@/pkgs/server/db/NewsRepository"

import { createDiag } from "@activescott/diag"
import { ReactNode } from "react"
import { ArticleTag } from "../components/ArticleTag"
import { hoursToSeconds } from "@/pkgs/isomorphic/duration"

const log = createDiag("shopping-agent:news")

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
const REVALIDATE_HOURS = 6
export const revalidate = hoursToSeconds(REVALIDATE_HOURS)

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

// (default=true) Dynamic segments not included in generateStaticParams are generated on demand: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
//export const dynamicParams = true // true | false,

type NewsParams = {
  params: { slug: string }
}


export async function generateMetadata({ params }: NewsParams) {
  const slug = params.slug

  log.debug(`generateMetadata for news slug ${slug}`)
  const article = await getPublishedArticleBySlug(slug)
  if (!article) {
    return notFound()
  }

  return {
    title: article.title,
    description: `${article.title} by ${article.authorFullName} on Coin Poet`,
    authors: { name: article.authorFullName },
    keywords: article.tags,
    publisher: "Coin Poet",
    openGraph: {
      title: article.title,
      description: article.title,
      url: `https://coinpoet.com/news/${slug}`,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      authors: [article.authorFullName],
      tags: article.tags,
    },
    alternates: {
      canonical: `https://coinpoet.com/news/${slug}`,
    },
  } satisfies Metadata
}

export default async function Page({ params }: NewsParams) {
  const article = await getPublishedArticleBySlug(params.slug)
  if (!article) {
    return notFound()
  }

  return (
    <>
      <Breadcrumbs title={article.title} />
      <div className="container mt-4">
        <article className="blog-post">
          <h1 className="blog-post-title mb-3">{article.title}</h1>
          <div className="blog-post-meta text-muted mb-4">
            <span>By {article.authorFullName}</span>
            {article.publishedAt && (
              <span> • {article.publishedAt.toLocaleDateString()}</span>
            )}
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="mb-3">
              {article.tags.map((tag) => (
                <ArticleTag tag={tag} key={tag} />
              ))}
            </div>
          )}
          <MarkdownContent content={article.content} />
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
          <a href="/">Home</a>
        </li>
        <li className="breadcrumb-item">
          <a href="/news">News</a>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          {title}
        </li>
      </ol>
    </nav>
  )
}
