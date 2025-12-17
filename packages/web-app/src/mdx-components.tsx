import type { MDXComponents } from "mdx/types"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    // Add more margin above h2 headings for better visual separation
    h2: ({ children, ...props }) => (
      <h2 className="mt-5" {...props}>
        {children}
      </h2>
    ),
  }
}
