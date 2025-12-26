import {
  parseSitemapXml,
  fetchSitemap,
  setFetchImpl,
  resetFetchImpl,
} from "./sitemap-parser.js"

describe("parseSitemapXml", () => {
  it("should parse valid sitemap XML with lastmod", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://gpupoet.com/</loc>
        <lastmod>2024-01-15T10:00:00Z</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>https://gpupoet.com/gpu/shop/rtx-4090</loc>
        <lastmod>2024-01-14T08:30:00Z</lastmod>
      </url>
    </urlset>`

    const entries = parseSitemapXml(xml)

    expect(entries).toHaveLength(2)
    expect(entries[0].url).toBe("https://gpupoet.com/")
    expect(entries[0].lastModified).toEqual(new Date("2024-01-15T10:00:00Z"))
    expect(entries[1].url).toBe("https://gpupoet.com/gpu/shop/rtx-4090")
    expect(entries[1].lastModified).toEqual(new Date("2024-01-14T08:30:00Z"))
  })

  it("should handle missing lastmod with epoch date", () => {
    const xml = `<urlset>
      <url>
        <loc>https://gpupoet.com/test</loc>
      </url>
    </urlset>`

    const entries = parseSitemapXml(xml)

    expect(entries).toHaveLength(1)
    expect(entries[0].url).toBe("https://gpupoet.com/test")
    expect(entries[0].lastModified).toEqual(new Date(0))
  })

  it("should return empty array for invalid XML without url blocks", () => {
    const entries = parseSitemapXml("not xml at all")
    expect(entries).toHaveLength(0)
  })

  it("should handle empty urlset", () => {
    const xml = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`
    const entries = parseSitemapXml(xml)
    expect(entries).toHaveLength(0)
  })

  it("should handle url blocks without loc tag", () => {
    const xml = `<urlset>
      <url>
        <lastmod>2024-01-15</lastmod>
      </url>
    </urlset>`

    const entries = parseSitemapXml(xml)
    expect(entries).toHaveLength(0)
  })

  it("should handle date-only lastmod format", () => {
    const xml = `<urlset>
      <url>
        <loc>https://gpupoet.com/page</loc>
        <lastmod>2024-01-15</lastmod>
      </url>
    </urlset>`

    const entries = parseSitemapXml(xml)

    expect(entries).toHaveLength(1)
    expect(entries[0].lastModified).toEqual(new Date("2024-01-15"))
  })
})

describe("fetchSitemap", () => {
  afterEach(() => {
    resetFetchImpl()
  })

  it("should fetch and parse sitemap", async () => {
    const mockXml = `<urlset>
      <url>
        <loc>https://gpupoet.com/</loc>
        <lastmod>2024-01-15T10:00:00Z</lastmod>
      </url>
    </urlset>`

    setFetchImpl(async () => new Response(mockXml, { status: 200 }))

    const entries = await fetchSitemap("https://gpupoet.com/sitemap.xml")

    expect(entries).toHaveLength(1)
    expect(entries[0].url).toBe("https://gpupoet.com/")
    expect(entries[0].lastModified).toEqual(new Date("2024-01-15T10:00:00Z"))
  })

  it("should throw on HTTP error", async () => {
    setFetchImpl(
      async () =>
        new Response("Not Found", { status: 404, statusText: "Not Found" }),
    )

    await expect(
      fetchSitemap("https://gpupoet.com/sitemap.xml"),
    ).rejects.toThrow("Failed to fetch sitemap: 404 Not Found")
  })

  it("should throw on 500 server error", async () => {
    setFetchImpl(
      async () =>
        new Response("Internal Server Error", {
          status: 500,
          statusText: "Internal Server Error",
        }),
    )

    await expect(
      fetchSitemap("https://gpupoet.com/sitemap.xml"),
    ).rejects.toThrow("Failed to fetch sitemap: 500 Internal Server Error")
  })
})
