const nextJest = require("next/jest")

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: "./" })

// Any custom config you want to pass to Jest
const customJestConfig = {
  //globalSetup: "<rootDir>/testing/jest.setup.js",
  //setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // pass in --coverage to collect coverage
  collectCoverage: false,
  coveragePathIgnorePatterns: ["/node_modules/"],
  // https://jestjs.io/docs/configuration#clearmocks-boolean
  clearMocks: true,
  // https://jestjs.io/docs/configuration#restoremocks-boolean
  restoreMocks: true,
}

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(customJestConfig)
