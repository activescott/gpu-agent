const { readFileSync } = require("fs")

const content = readFileSync("./generate-gpu-info-pages.md", {
  encoding: "utf-8",
})

console.log(JSON.stringify({ input: content }))
