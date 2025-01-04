import dotenv from "dotenv"
import path from "path"

export default function loadEnv() {
  const envPath = path.resolve(__dirname, "../../.env.local")
  const result = dotenv.config({
    path: envPath,
  })
  if (result.error) {
    throw result.error
  }
}
