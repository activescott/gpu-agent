import remarkGfm from "remark-gfm"
import createMDX from "@next/mdx"
import addClasses from "rehype-add-classes"

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // MDX configuration: https://nextjs.org/docs/app/building-your-application/configuring/mdx
  pageExtensions: ["mdx", "ts", "tsx"],

  async rewrites() {
    return [
      // posthog reverse-proxy ingestion per https://posthog.com/docs/advanced/proxy/nextjs
      {
        source: "/a/:path*",
        destination: "https://app.posthog.com/:path*",
      },
      /* proxy ebay images as content blockers block them from a different domain
      images could be in https://i.ebayimg.com/thumbs/images/... or https://i.ebayimg.com/images/...
      */
      {
        source: "/ei/:path*",
        destination: "https://i.ebayimg.com/:path*",
      },
    ]
  },

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
