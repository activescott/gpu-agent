import { MetadataRoute } from "next"
import sitemapJson from "./sitemap.json"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { IterableElement } from "type-fest"

/* eslint-disable import/no-unused-modules */

const sitemapEntries = [...sitemapJson.data]

// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const domain_url = `https://${ISOMORPHIC_CONFIG.NEXT_PUBLIC_DOMAIN()}`
  type SitemapItem = IterableElement<MetadataRoute.Sitemap>
  const items = [
    ...sitemapEntries.map((item) => {
      return {
        url: `${domain_url}${item.path}`,
        changeFrequency: "monthly",
        priority: 0.8,
      } satisfies SitemapItem
    }),
    {
      url: `${domain_url}/`,
      changeFrequency: "daily",
      lastModified: today,
      priority: 0.9,
    } satisfies SitemapItem,
  ]

  return items
}
