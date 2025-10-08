import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { MetadataRoute } from "next"

/* eslint-disable import/no-unused-modules */

// Force dynamic rendering to avoid build-time dependency on NEXT_PUBLIC_DOMAIN environment variable
// The robots.txt needs the domain name for the sitemap URL, but we don't want to bake the domain into the Docker image
export const dynamic = 'force-dynamic'

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
