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
  async redirects() {
    return [
      // New route structure redirects (ml/* -> gpu/*)
      // Shopping/Buy pages
      {
        source: "/ml/shop/gpu/:gpuSlug",
        destination: "/gpu/listing/:gpuSlug",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu",
        destination: "/gpu/buy/ai/cost-per-fp32-flops",
        permanent: true,
      },
      // Cost-per-performance pages (shop/performance -> buy/ai/cost-per)
      {
        source: "/ml/shop/gpu/performance/cost-per-fp32-flops",
        destination: "/gpu/buy/ai/cost-per-fp32-flops",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-tensor-core",
        destination: "/gpu/buy/ai/cost-per-tensor-core",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-fp16-flops",
        destination: "/gpu/buy/ai/cost-per-fp16-flops",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-int8-tops",
        destination: "/gpu/buy/ai/cost-per-int8-tops",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-memory-gb",
        destination: "/gpu/buy/ai/cost-per-memory-gb",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-memory-bandwidth-gbs",
        destination: "/gpu/buy/ai/cost-per-memory-bandwidth-gbs",
        permanent: true,
      },
      // Ranking pages (learn/gpu/ranking -> gpu/ranking/ai)
      {
        source: "/ml/learn/gpu/ranking/fp32-flops",
        destination: "/gpu/ranking/ai/fp32-flops",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/ranking/tensor-cores",
        destination: "/gpu/ranking/ai/tensor-cores",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/ranking/fp16-flops",
        destination: "/gpu/ranking/ai/fp16-flops",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/ranking/int8-tops",
        destination: "/gpu/ranking/ai/int8-tops",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/ranking/memory-gb",
        destination: "/gpu/ranking/ai/memory-gb",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/ranking/memory-bandwidth-gbs",
        destination: "/gpu/ranking/ai/memory-bandwidth-gbs",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/ranking",
        destination: "/gpu/ranking/ai/fp32-flops",
        permanent: true,
      },
      // Learn pages - keeping at /ml/learn for now
      // Note: Removed redirects for use-case and models pages because /gpu/learn/ai/* routes don't exist yet
      {
        source: "/ml/learn/gpu/specifications",
        destination: "/gpu/ranking/ai/fp32-flops",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/:gpuSlug",
        destination: "/gpu/learn/card/:gpuSlug",
        permanent: true,
      },
      {
        source: "/ml/learn",
        destination: "/gpu/learn/ai",
        permanent: true,
      },

      // Legacy redirects
      {
        source: "/ml/info/:path*",
        destination: "/ml/learn/:path*",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-rtx-a5000-gpu",
        destination: "/gpu/listing/nvidia-rtx-a5000",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-a10-pci-24gb",
        destination: "/gpu/listing/nvidia-a10",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-a100-sxm-80gb",
        destination: "/gpu/listing/nvidia-a100-pcie",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-h100-sxm-80gb",
        destination: "/gpu/listing/nvidia-h100-pcie",
        permanent: true,
      },
      // removed SXM cards:
      {
        source: "/ml/shop/gpu/nvidia-a100-sxm",
        destination: "/gpu/listing/nvidia-a100-pcie",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-a100-sxm",
        destination: "/gpu/listing/nvidia-a100-pcie",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/nvidia-h100-sxm",
        destination: "/gpu/listing/nvidia-h100-pcie",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-h100-sxm",
        destination: "/gpu/listing/nvidia-h100-pcie",
        permanent: true,
      },
      {
        // this one is an old path style (note missing /ml/learn/...) that Google Search Console found and saw as a 404.
        source: "/ml/gpu/nvidia-h100-sxm-80gb",
        destination: "/gpu/listing/nvidia-h100-pcie",
        permanent: true,
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
