/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // [...]
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.cjs.json",
      },
    ],
  },
  // testPathIgnorePatterns to exclude the dist directory; or after builds jest gets confused
  testPathIgnorePatterns: ["/node_modules/", "dist/"],

  // https://jestjs.io/docs/configuration#clearmocks-boolean
  clearMocks: true,
  // https://jestjs.io/docs/configuration#restoremocks-boolean
  restoreMocks: true,
}
