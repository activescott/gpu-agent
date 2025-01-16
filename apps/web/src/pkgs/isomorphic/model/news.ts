import { z } from "zod"

export const NewsStatus = z.enum(["DRAFT", "PUBLISHED"])
export type NewsStatus = z.infer<typeof NewsStatus>

export const NewsArticleSchema = z.object({
  id: z.string().cuid2(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  status: NewsStatus.default("DRAFT"),
  tags: z.array(z.string()),
  authorFullName: z.string(),
  createdAt: z.union([z.date(), z.string()]).pipe(z.coerce.date()),
  updatedAt: z.union([z.date(), z.string()]).pipe(z.coerce.date()),
  publishedAt: z
    .union([z.date(), z.string(), z.null()])
    .pipe(z.coerce.date().nullable()),
})

export type NewsArticle = z.infer<typeof NewsArticleSchema>
