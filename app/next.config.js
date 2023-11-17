const withMDX = require("@next/mdx")()

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // MDX configuration: https://nextjs.org/docs/app/building-your-application/configuring/mdx
  pageExtensions: ["mdx", "ts", "tsx"],

  // Optionally, add any other Next.js config below
}

module.exports = withMDX(nextConfig)
