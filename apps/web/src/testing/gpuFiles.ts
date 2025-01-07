import path from "path"
import yaml from "yaml"
import { Gpu, GpuSchema } from "@/pkgs/isomorphic/model"
import { appRoot } from "@/pkgs/server/path"
import { readFile } from "fs/promises"

/** loads a gpu from yaml file. */
export async function loadGpuFromYaml(gpuName: string): Promise<Gpu> {
  const content = await readFile(
    path.join(appRoot(), "..", "..", "..", "data", "gpu-data", `${gpuName}`),
    "utf8",
  )
  const gpuData = yaml.parse(content)
  const validatedGpu = GpuSchema.parse(gpuData)
  return validatedGpu
}
