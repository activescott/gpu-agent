import { MetadataRoute } from "next"
import { data } from "./sitemap.json"

/* eslint-disable import/no-unused-modules */

// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const host_url = "https://coinpoet.com"
  return data.map((item) => {
    return {
      url: `${host_url}${item.path}`,
      changeFrequency: "daily",
      priority: 0.8,
    }
  }) as MetadataRoute.Sitemap
}
