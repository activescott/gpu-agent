import path from "path"
import yaml from "yaml"
import { MlModel, MlModelSchema } from "@/pkgs/isomorphic/model"
import { appRoot } from "@/pkgs/server/path"
import { readFile, readdir } from "fs/promises"
import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:ModelRepository")

function getModelDataDir(): string {
  return path.join(appRoot(), "..", "..", "..", "data", "model-data")
}

/**
 * Loads a single model from YAML file by slug.
 */
export async function getModel(modelSlug: string): Promise<MlModel> {
  const filePath = path.join(getModelDataDir(), `${modelSlug}.yaml`)
  log.debug("Loading model from:", filePath)
  const content = await readFile(filePath, "utf8")
  const modelData = yaml.parse(content)
  return MlModelSchema.parse(modelData)
}

/**
 * Lists all available models from YAML files.
 */
export async function listModels(): Promise<MlModel[]> {
  const dataDir = getModelDataDir()
  const files = await readdir(dataDir)
  const yamlFiles = files.filter(
    (f) => f.endsWith(".yaml") && !f.endsWith(".schema.json"),
  )

  const models = await Promise.all(
    yamlFiles.map(async (file) => {
      const content = await readFile(path.join(dataDir, file), "utf8")
      const modelData = yaml.parse(content)
      return MlModelSchema.parse(modelData)
    }),
  )
  return models.sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Returns all model slugs for static generation.
 */
export async function getModelSlugs(): Promise<string[]> {
  const dataDir = getModelDataDir()
  const files = await readdir(dataDir)
  return files
    .filter((f) => f.endsWith(".yaml") && !f.includes("schema"))
    .map((f) => f.replace(".yaml", ""))
}
