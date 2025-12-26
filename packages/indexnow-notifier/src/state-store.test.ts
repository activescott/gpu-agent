import { rm, mkdir, writeFile, readFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import {
  getLastNotified,
  setLastNotified,
  needsNotification,
  encodeUrlToFilename,
  decodeFilenameToUrl,
} from "./state-store.js"

describe("encodeUrlToFilename / decodeFilenameToUrl", () => {
  it("should encode and decode simple URL", () => {
    const url = "https://gpupoet.com/"
    const filename = encodeUrlToFilename(url)
    expect(filename).toMatch(/\.yaml$/)
    expect(decodeFilenameToUrl(filename)).toBe(url)
  })

  it("should encode and decode URL with special characters", () => {
    const url = "https://gpupoet.com/gpu/shop/nvidia-rtx-4090?foo=bar&baz=123"
    const filename = encodeUrlToFilename(url)
    expect(filename).toMatch(/\.yaml$/)
    // Filename should not contain any problematic characters
    expect(filename).not.toMatch(/[/\\:*?"<>|]/)
    expect(decodeFilenameToUrl(filename)).toBe(url)
  })

  it("should produce different filenames for different URLs", () => {
    const url1 = "https://gpupoet.com/page1"
    const url2 = "https://gpupoet.com/page2"
    const filename1 = encodeUrlToFilename(url1)
    const filename2 = encodeUrlToFilename(url2)
    expect(filename1).not.toBe(filename2)
  })

  it("should produce human-readable filenames with percent-encoding", () => {
    const url = "https://gpupoet.com/gpu/nvidia-rtx-4090"
    const filename = encodeUrlToFilename(url)
    // Should be URL-encoded, containing readable parts
    expect(filename).toBe(
      "https%3A%2F%2Fgpupoet.com%2Fgpu%2Fnvidia-rtx-4090.yaml",
    )
  })
})

describe("state-store", () => {
  const testDir = join(tmpdir(), `indexnow-test-${Date.now()}-${Math.random()}`)

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

  describe("getLastNotified", () => {
    it("should return null for non-existent URL", async () => {
      const result = await getLastNotified(
        testDir,
        "https://gpupoet.com/new-page",
      )
      expect(result).toBeNull()
    })

    it("should return stored timestamp for existing URL", async () => {
      const url = "https://gpupoet.com/existing"
      const timestamp = new Date("2024-01-15T10:00:00Z")

      // Manually create state file
      const filename = encodeUrlToFilename(url)
      await writeFile(
        join(testDir, filename),
        `lastModified: "${timestamp.toISOString()}"\n`,
        "utf-8",
      )

      const result = await getLastNotified(testDir, url)
      expect(result).toEqual(timestamp)
    })

    it("should return null for invalid date in state file", async () => {
      const url = "https://gpupoet.com/invalid"
      const filename = encodeUrlToFilename(url)
      await writeFile(
        join(testDir, filename),
        "lastModified: not-a-date\n",
        "utf-8",
      )

      const result = await getLastNotified(testDir, url)
      expect(result).toBeNull()
    })
  })

  describe("setLastNotified", () => {
    it("should create directory and write state file", async () => {
      const url = "https://gpupoet.com/new"
      const timestamp = new Date("2024-01-15T12:00:00Z")
      const subDir = join(testDir, "subdir")

      await setLastNotified(subDir, url, timestamp)

      const filename = encodeUrlToFilename(url)
      const content = await readFile(join(subDir, filename), "utf-8")
      expect(content).toBe(`lastModified: "${timestamp.toISOString()}"\n`)
    })

    it("should overwrite existing state file", async () => {
      const url = "https://gpupoet.com/update"
      const oldTimestamp = new Date("2024-01-15T10:00:00Z")
      const newTimestamp = new Date("2024-01-16T10:00:00Z")

      await setLastNotified(testDir, url, oldTimestamp)
      await setLastNotified(testDir, url, newTimestamp)

      const result = await getLastNotified(testDir, url)
      expect(result).toEqual(newTimestamp)
    })
  })

  describe("needsNotification", () => {
    it("should return true for never-notified URL", async () => {
      const url = "https://gpupoet.com/new"
      const lastModified = new Date("2024-01-15T10:00:00Z")

      const result = await needsNotification(testDir, url, lastModified)
      expect(result).toBe(true)
    })

    it("should return true for URL updated since last notification", async () => {
      const url = "https://gpupoet.com/updated"
      const lastNotifiedTime = new Date("2024-01-15T10:00:00Z")
      const lastModified = new Date("2024-01-16T10:00:00Z")

      await setLastNotified(testDir, url, lastNotifiedTime)

      const result = await needsNotification(testDir, url, lastModified)
      expect(result).toBe(true)
    })

    it("should return false for URL not updated since last notification", async () => {
      const url = "https://gpupoet.com/unchanged"
      const lastNotifiedTime = new Date("2024-01-16T10:00:00Z")
      const lastModified = new Date("2024-01-15T10:00:00Z")

      await setLastNotified(testDir, url, lastNotifiedTime)

      const result = await needsNotification(testDir, url, lastModified)
      expect(result).toBe(false)
    })

    it("should return false for URL with same modification time", async () => {
      const url = "https://gpupoet.com/same"
      const timestamp = new Date("2024-01-15T10:00:00Z")

      await setLastNotified(testDir, url, timestamp)

      const result = await needsNotification(testDir, url, timestamp)
      expect(result).toBe(false)
    })
  })
})
