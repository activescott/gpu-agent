import remarkGfm from "remark-gfm"
import createMDX from "@next/mdx"
import addClasses from "rehype-add-classes"

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // MDX configuration: https://nextjs.org/docs/app/building-your-application/configuring/mdx
  pageExtensions: ["mdx", "ts", "tsx"],

  // Optionally, add any other Next.js config below
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[addClasses, { table: "table" }]],
  },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
