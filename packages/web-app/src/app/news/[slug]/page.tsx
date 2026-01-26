import type { Metadata } from "next"
import { notFound } from "next/navigation"
import MarkdownContent from "@/pkgs/client/components/MarkdownContent"
import { getPublishedArticleBySlug } from "@/pkgs/server/db/NewsRepository"

import { createLogger } from "@/lib/logger"
import { ReactNode } from "react"
import { ArticleTag } from "../components/ArticleTag"
import Link from "next/link"

const log = createLogger("news")

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 21_600

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

// (default=true) Dynamic segments not included in generateStaticParams are generated on demand: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
//export const dynamicParams = true // true | false,

type NewsParams = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: NewsParams) {
  const params = await props.params
  const slug = params.slug

  log.debug(`generateMetadata for news slug ${slug}`)
  const article = await getPublishedArticleBySlug(slug)
  if (!article) {
    return notFound()
  }

  return {
    title: article.title,
    description: `${article.title} by ${article.authorFullName} on GPU Poet`,
    authors: { name: article.authorFullName },
    keywords: article.tags,
    publisher: "GPU Poet",
    openGraph: {
      title: article.title,
      description: article.title,
      url: `https://gpupoet.com/news/${slug}`,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      authors: [article.authorFullName],
      tags: article.tags,
      images: [
        {
          url: "https://gpupoet.com/images/social.png",
          width: 2400,
          height: 1260,
          alt: article.title,
        },
      ],
    },
    alternates: {
      canonical: `https://gpupoet.com/news/${slug}`,
    },
  } satisfies Metadata
}

export default async function Page(props: NewsParams) {
  const params = await props.params
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
          <Link href="/">Home</Link>
        </li>
        <li className="breadcrumb-item">
          <Link href="/news">News</Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          {title}
        </li>
      </ol>
    </nav>
  )
}
