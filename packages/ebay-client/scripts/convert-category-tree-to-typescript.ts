#!/usr/bin/env -S npx ts-node-esm
import { createWriteStream } from "fs"
import { readFile } from "fs/promises"
import { Writable } from "stream"
import path from "path"

/**
 * This file writes the category tree from an eBay marketplace JSON from the Taxonomy API's getCategoryTree method.
 */

interface Category {
  category: {
    categoryId: string
    categoryName: string
  }
  childCategoryTreeNodes: Category[]
  categoryTreeNodeLevel: number
}

const marketplaces = ["EBAY_US"]

const __dirname = path.dirname(new URL(import.meta.url).pathname)

for (const marketplace of marketplaces) {
  const jsonFilePath = path.resolve(
    __dirname,
    `../data/api-examples/api-taxonomy-getCategoryTree-${marketplace}.response.json`,
  )

  const outputFilePath = path.resolve(
    __dirname,
    `../src/categories/${marketplace}.ts`,
  )

  const data = await readFile(jsonFilePath, { encoding: "utf8" })
  const categoryTree = JSON.parse(data)

  const rootNode = categoryTree.rootCategoryNode as Category

  const writeStream = createWriteStream(outputFilePath, { encoding: "utf8" })
  const out = Writable.toWeb(writeStream)
  const writer = out.getWriter()
  try {
    const writeLine = (line: string) => writer.write(line + "\n")

    function writeCategory({
      category,
      childCategoryTreeNodes,
      categoryTreeNodeLevel,
    }: Category) {
      console.info("writing category", category.categoryName)
      const indent = "  ".repeat(categoryTreeNodeLevel)

      writeLine(indent + `["${category.categoryName}"]: {`)
      writeLine(indent + `  categoryName: "${category.categoryName}",`)
      writeLine(indent + `  categoryId: "${category.categoryId}",`)
      if (childCategoryTreeNodes && childCategoryTreeNodes.length > 0) {
        for (const child of childCategoryTreeNodes) {
          writeCategory(child)
        }
      }
      writeLine(indent + `},`)
    }

    writeLine(`export const categories = {`)
    writeCategory(rootNode)
    writeLine(`}`)
  } finally {
    writer.close()
  }
}
