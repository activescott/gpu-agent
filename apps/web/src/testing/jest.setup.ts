import { config } from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// disable because this is used by jest.setup.ts
// eslint-disable-next-line import/no-unused-modules
export default function loadEnv() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const envPath = path.resolve(__dirname, "../../.env.local")
  const result = config({
    path: envPath,
  })
  if (result.error) {
    throw result.error
  }
}
