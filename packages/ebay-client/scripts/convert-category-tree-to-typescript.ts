#!/usr/bin/env -S npx ts-node-esm

/**
 * This file writes the category tree from an eBay marketplace JSON from the Taxonomy API's getCategoryTree method.
 */
import { createWriteStream } from "fs"
import { readFile } from "fs/promises"
import { Writable } from "stream"
import path from "path"

/* eslint-disable no-console */
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

type WriteLine = (line: string) => Promise<void>

async function writeCategory(
  writeLine: WriteLine,
  { category, childCategoryTreeNodes, categoryTreeNodeLevel }: Category,
): Promise<void> {
  console.info("writing category", category.categoryName)

  const indent = "  ".repeat(categoryTreeNodeLevel)

  await writeLine(indent + `["${category.categoryName}"]: {`)
  await writeLine(indent + `  categoryName: "${category.categoryName}",`)
  await writeLine(indent + `  categoryId: "${category.categoryId}",`)
  if (childCategoryTreeNodes && childCategoryTreeNodes.length > 0) {
    for (const child of childCategoryTreeNodes) {
      await writeCategory(writeLine, child)
    }
  }
  await writeLine(indent + `},`)
}

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
  const writeLine = (line: string): Promise<void> => writer.write(line + "\n")

  try {
    await writeLine(`const categories = {`)
    await writeCategory(writeLine, rootNode)
    await writeLine(`}`)
    await writeLine(`export default categories`)
  } finally {
    await writer.close()
  }
}
