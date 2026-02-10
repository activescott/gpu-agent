import categories from "./EBAY_US"

it("should have some categories", () => {
  expect(categories).toHaveProperty("Root")
  const root = categories.Root
  expect(root).toHaveProperty("Collectibles")

  // check an arbitrary one:
  const videoCards =
    root["Computers/Tablets & Networking"]["Computer Components & Parts"][
      "Graphics/Video Cards"
    ]
  expect(videoCards).toHaveProperty("categoryName", "Graphics/Video Cards")
  expect(videoCards).toHaveProperty("categoryId", "27386")
})
