import { MetadataRoute } from "next"

/* eslint-disable import/no-unused-modules */

// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return [
    {
      url: "https://coinpoet.com/policy/terms/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/policy/privacy/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/models/rnn-t/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/models/retinanet/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/models/resnet/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/models/llama-2/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/models/gpt-j/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/models/dlrm-v2/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/models/bert/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/models/3d-unet/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/gpu/specifications/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://coinpoet.com/ml/gpu/nvidia-l40/page.mdx",
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]
}
