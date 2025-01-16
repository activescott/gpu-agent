import { ReactNode } from "react"
import remarkGfm from "remark-gfm"
import { MDXRemote } from "next-mdx-remote/rsc"

function MarkdownContent({ content }: { content: string }): ReactNode {
  return (
    <div className="markdown-content">
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  )
}

export default MarkdownContent
