import { ReactNode } from "react"

export function ArticleTag({ tag }: { tag: string }): ReactNode {
  return (
    <span key={tag} className="badge bg-secondary me-2">
      {tag}
    </span>
  )
}
