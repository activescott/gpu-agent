import { readFileSync } from "fs"
import path from "path"
import { HardwarePrecisions } from "./specs"

describe("HardwarePrecisions", () => {
  it("matches the supportedHardwareOperations enum in gpu-spec.schema.json", () => {
    const schemaPath = path.join(
      process.cwd(),
      "../../data/gpu-data/gpu-spec.schema.json",
    )
    const schema = JSON.parse(readFileSync(schemaPath, "utf8"))
    const schemaEnum: string[] =
      schema.properties.supportedHardwareOperations.items.enum

    expect(new Set(HardwarePrecisions)).toEqual(new Set(schemaEnum))
  })
})
