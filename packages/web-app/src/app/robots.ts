import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { MetadataRoute } from "next"

/* eslint-disable import/no-unused-modules */

// Force dynamic rendering to get runtime environment variables
export const dynamic = "force-dynamic"
// Cache for 24 hours
export const revalidate = 86_400

// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
// https://developers.google.com/search/docs/crawling-indexing/robots/intro
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/bye",
        "/ei/",
        "/_next/",
        "/a/",
        "/ops/",
        "/internal",
      ],
    },
    sitemap: `https://${ISOMORPHIC_CONFIG.PUBLIC_DOMAIN()}/sitemap.xml`,
  }
}
