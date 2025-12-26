import { rm, mkdir } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import { findUpdatedUrls } from "./notifier.js"
import { SitemapEntry } from "./types.js"
import { setLastNotified } from "./state-store.js"

describe("findUpdatedUrls", () => {
  const testDir = join(
    tmpdir(),
    `indexnow-notifier-test-${Date.now()}-${Math.random()}`,
  )

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  it("should identify new URLs not in state", async () => {
    const entries: SitemapEntry[] = [
      {
        url: "https://gpupoet.com/new-page",
        lastModified: new Date("2024-01-15T10:00:00Z"),
      },
    ]

    const result = await findUpdatedUrls(entries, testDir)

    expect(result).toEqual(["https://gpupoet.com/new-page"])
  })

  it("should identify URLs updated since last notification", async () => {
    const url = "https://gpupoet.com/updated"

    // Set last notified to older than the sitemap entry
    await setLastNotified(testDir, url, new Date("2024-01-15T10:00:00Z"))

    const entries: SitemapEntry[] = [
      {
        url,
        lastModified: new Date("2024-01-16T10:00:00Z"),
      },
    ]

    const result = await findUpdatedUrls(entries, testDir)

    expect(result).toEqual([url])
  })

  it("should not include URLs unchanged since last notification", async () => {
    const url = "https://gpupoet.com/unchanged"

    // Set last notified to same as sitemap entry
    await setLastNotified(testDir, url, new Date("2024-01-15T10:00:00Z"))

    const entries: SitemapEntry[] = [
      {
        url,
        lastModified: new Date("2024-01-15T10:00:00Z"),
      },
    ]

    const result = await findUpdatedUrls(entries, testDir)

    expect(result).toEqual([])
  })

  it("should not include URLs with older modification than last notification", async () => {
    const url = "https://gpupoet.com/older"

    // Set last notified to newer than sitemap entry
    await setLastNotified(testDir, url, new Date("2024-01-16T10:00:00Z"))

    const entries: SitemapEntry[] = [
      {
        url,
        lastModified: new Date("2024-01-14T10:00:00Z"),
      },
    ]

    const result = await findUpdatedUrls(entries, testDir)

    expect(result).toEqual([])
  })

  it("should handle mixed new, updated, and unchanged URLs", async () => {
    // Set up existing state for some URLs
    await setLastNotified(
      testDir,
      "https://gpupoet.com/updated",
      new Date("2024-01-14T00:00:00Z"),
    )
    await setLastNotified(
      testDir,
      "https://gpupoet.com/unchanged",
      new Date("2024-01-12T00:00:00Z"),
    )

    const entries: SitemapEntry[] = [
      {
        url: "https://gpupoet.com/new",
        lastModified: new Date("2024-01-15T00:00:00Z"),
      },
      {
        url: "https://gpupoet.com/updated",
        lastModified: new Date("2024-01-16T00:00:00Z"), // Newer than stored
      },
      {
        url: "https://gpupoet.com/unchanged",
        lastModified: new Date("2024-01-10T00:00:00Z"), // Older than stored
      },
    ]

    const result = await findUpdatedUrls(entries, testDir)

    expect(result).toHaveLength(2)
    expect(result).toContain("https://gpupoet.com/new")
    expect(result).toContain("https://gpupoet.com/updated")
    expect(result).not.toContain("https://gpupoet.com/unchanged")
  })

  it("should return empty array for empty sitemap", async () => {
    const result = await findUpdatedUrls([], testDir)
    expect(result).toEqual([])
  })
})
