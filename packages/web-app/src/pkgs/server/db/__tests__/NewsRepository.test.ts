import {
  getPublishedArticleBySlug,
  listPublishedArticles,
} from "../NewsRepository"
import { prismaSingleton } from "../db"
import { NewsArticle } from "@/pkgs/isomorphic/model/news"

jest.mock("../db", () => ({
  prismaSingleton: {
    newsArticle: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

describe("NewsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("listPublishedArticles", () => {
    it("should return published articles ordered by date", async () => {
      const mockArticles: NewsArticle[] = [
        {
          id: "article1",
          slug: "first-article",
          title: "First Article",
          content: "Content 1",
          status: "PUBLISHED",
          tags: ["tag1", "tag2"],
          authorFullName: "John Doe",
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-02"),
          publishedAt: new Date("2023-01-02"),
        },
        {
          id: "article2",
          slug: "second-article",
          title: "Second Article",
          content: "Content 2",
          status: "PUBLISHED",
          tags: ["tag3"],
          authorFullName: "Jane Smith",
          createdAt: new Date("2023-01-03"),
          updatedAt: new Date("2023-01-04"),
          publishedAt: new Date("2023-01-04"),
        },
      ]

      const findManySpy = jest
        .spyOn(prismaSingleton.newsArticle, "findMany")
        .mockResolvedValueOnce(mockArticles)

      const result = await listPublishedArticles()

      expect(result).toEqual(mockArticles)
      expect(findManySpy).toHaveBeenCalledWith({
        where: {
          status: "PUBLISHED",
          publishedAt: { not: null },
        },
        orderBy: { publishedAt: "desc" },
      })
    })
  })

  describe("getPublishedArticleBySlug", () => {
    it("should return published article by slug", async () => {
      const mockArticle: NewsArticle = {
        id: "article1",
        slug: "test-article",
        title: "Test Article",
        content: "Content",
        status: "PUBLISHED",
        tags: ["tag1"],
        authorFullName: "John Doe",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
        publishedAt: new Date("2023-01-02"),
      }

      const findFirstSpy = jest
        .spyOn(prismaSingleton.newsArticle, "findFirst")
        .mockResolvedValueOnce(mockArticle)

      const result = await getPublishedArticleBySlug("test-article")

      expect(result).toEqual(mockArticle)
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          slug: "test-article",
          status: "PUBLISHED",
          publishedAt: { not: null },
        },
      })
    })

    it("should return null for draft articles", async () => {
      const findFirstSpy = jest
        .spyOn(prismaSingleton.newsArticle, "findFirst")
        .mockResolvedValueOnce(null)

      const result = await getPublishedArticleBySlug("draft-article")

      expect(result).toBeNull()
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          slug: "draft-article",
          status: "PUBLISHED",
          publishedAt: { not: null },
        },
      })
    })
  })
})
