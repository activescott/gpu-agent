import createMDX from "@next/mdx"

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  // MDX configuration: https://nextjs.org/docs/app/building-your-application/configuring/mdx
  pageExtensions: ["mdx", "ts", "tsx"],

  // Silence Bootstrap Sass deprecation warnings from dependencies
  // https://sass-lang.com/documentation/js-api/interfaces/options/#quietDeps
  sassOptions: {
    quietDeps: true,
  },

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
        destination: "/gpu/shop/:gpuSlug",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu",
        destination: "/gpu/price-compare/ai/fp32-flops",
        permanent: true,
      },
      // Cost-per-performance pages (shop/performance -> price-compare/ai)
      {
        source: "/ml/shop/gpu/performance/cost-per-fp32-flops",
        destination: "/gpu/price-compare/ai/fp32-flops",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-tensor-core",
        destination: "/gpu/price-compare/ai/tensor-cores",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-fp16-flops",
        destination: "/gpu/price-compare/ai/fp16-flops",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-int8-tops",
        destination: "/gpu/price-compare/ai/int8-tops",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-memory-gb",
        destination: "/gpu/price-compare/ai/memory-gb",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/performance/cost-per-memory-bandwidth-gbs",
        destination: "/gpu/price-compare/ai/memory-bandwidth-gbs",
        permanent: true,
      },
      // Ranking pages (learn/gpu/ranking -> gpu/ranking/ai)
      {
        source: "/ml/learn/gpu/ranking/:slug",
        destination: "/gpu/ranking/ai/:slug",
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
        destination: "/gpu/learn/card/nvidia-rtx-a5000",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-a10-pci-24gb",
        destination: "/gpu/learn/card/nvidia-a10",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-a100-sxm-80gb",
        destination: "/gpu/learn/card/nvidia-a100-pcie",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-h100-sxm-80gb",
        destination: "/gpu/learn/card/nvidia-h100-pcie",
        permanent: true,
      },
      // removed SXM cards:
      {
        source: "/ml/shop/gpu/nvidia-a100-sxm",
        destination: "/gpu/shop/nvidia-a100-pcie",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-a100-sxm",
        destination: "/gpu/learn/card/nvidia-a100-pcie",
        permanent: true,
      },
      {
        source: "/ml/shop/gpu/nvidia-h100-sxm",
        destination: "/gpu/shop/nvidia-h100-pcie",
        permanent: true,
      },
      {
        source: "/ml/learn/gpu/nvidia-h100-sxm",
        destination: "/gpu/learn/card/nvidia-h100-pcie",
        permanent: true,
      },
      {
        // this one is an old path style (note missing /ml/learn/...) that Google Search Console found and saw as a 404.
        source: "/ml/gpu/nvidia-h100-sxm-80gb",
        destination: "/gpu/learn/card/nvidia-h100-pcie",
        permanent: true,
      },
      // Model slug renames
      {
        source: "/ml/learn/models/dlrm-v2",
        destination: "/ml/learn/models/dlrm",
        permanent: true,
      },

      // Price-compare slug migration: cost-per-* -> new DB slugs
      // AI specs
      {
        source: "/gpu/price-compare/ai/cost-per-fp32-flops",
        destination: "/gpu/price-compare/ai/fp32-flops",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/ai/cost-per-fp16-flops",
        destination: "/gpu/price-compare/ai/fp16-flops",
        permanent: true,
      },
      // Alternative slug variants (tflops -> flops)
      {
        source: "/gpu/price-compare/ai/fp32-tflops",
        destination: "/gpu/price-compare/ai/fp32-flops",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/ai/fp16-tflops",
        destination: "/gpu/price-compare/ai/fp16-flops",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/ai/cost-per-fp32-tflops",
        destination: "/gpu/price-compare/ai/fp32-flops",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/ai/cost-per-fp16-tflops",
        destination: "/gpu/price-compare/ai/fp16-flops",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/ai/cost-per-tensor-core",
        destination: "/gpu/price-compare/ai/tensor-cores",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/ai/cost-per-int8-tops",
        destination: "/gpu/price-compare/ai/int8-tops",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/ai/cost-per-memory-gb",
        destination: "/gpu/price-compare/ai/memory-gb",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/ai/cost-per-memory-bandwidth-gbs",
        destination: "/gpu/price-compare/ai/memory-bandwidth-gbs",
        permanent: true,
      },
      // Gaming benchmark slug changes:
      {
        source: "/gpu/price-compare/gaming/cost-per-counter-strike-2-fps-3840x2160",
        destination: "/gpu/price-compare/gaming/counter-strike-2-fps-3840x2160",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/gaming/cost-per-counter-strike-2-fps-2560x1440",
        destination: "/gpu/price-compare/gaming/counter-strike-2-fps-2560x1440",
        permanent: true,
      },
      {
        source: "/gpu/price-compare/gaming/cost-per-counter-strike-2-fps-1920x1080",
        destination: "/gpu/price-compare/gaming/counter-strike-2-fps-1920x1080",
        permanent: true,
      },
      {
        source: "/gpu/benchmark/gaming/3dmark-wildlife-extreme-fps",
        destination: "/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160",
        permanent: true,
      },
      {
        // Old cost-per- URL redirects to resolution-specific URL
        source: "/gpu/price-compare/gaming/cost-per-3dmark-wildlife-extreme-fps",
        destination: "/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160",
        permanent: true,
      },
      {
        // URL without resolution redirects to 4K version
        source: "/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps",
        destination: "/gpu/price-compare/gaming/3dmark-wildlife-extreme-fps-3840x2160",
        permanent: true,
      },
    ]
  },

  // Optionally, add any other Next.js config below
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: [
      ['rehype-class-names', { table: 'table' }]
    ],
  },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
