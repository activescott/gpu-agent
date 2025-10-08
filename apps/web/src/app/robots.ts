import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { MetadataRoute } from "next"

/* eslint-disable import/no-unused-modules */

// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
// https://developers.google.com/search/docs/crawling-indexing/robots/intro
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/bye", "/ei/", "/_next/", "/a/", "/ops/"],
    },
    sitemap: `https://${ISOMORPHIC_CONFIG.NEXT_PUBLIC_DOMAIN()}/sitemap.xml`,
  }
}
