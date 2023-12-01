import { MetadataRoute } from "next"
import sitemapJson from "./sitemap.json"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { IterableElement } from "type-fest"

/* eslint-disable import/no-unused-modules */

type SitemapItem = IterableElement<MetadataRoute.Sitemap>

const sitemapEntries = [...sitemapJson.data]

// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const domain_url = `https://${ISOMORPHIC_CONFIG.NEXT_PUBLIC_DOMAIN()}`

  const items = [
    ...sitemapEntries.map((item) => {
      return {
        url: `${domain_url}${item.path}`,
        changeFrequency: chooseChangeFrequency(item),
        priority: 0.8,
        lastModified: item.lastModified,
      } satisfies SitemapItem
    }),
    // then add the root/home page:
    {
      url: `${domain_url}/`,
      changeFrequency: "daily",
      lastModified: today,
      priority: 0.9,
    } satisfies SitemapItem,
  ]

  return items
}

interface SitemapJsonItem {
  path: string
  title: string
  lastModified?: string
}

function chooseChangeFrequency(
  item: SitemapJsonItem,
): SitemapItem["changeFrequency"] {
  const path = item.path
  if (path.startsWith("/ml/shop")) {
    return "daily"
  }
  if (path.startsWith("/policy")) {
    return "yearly"
  }
  return "monthly"
}
