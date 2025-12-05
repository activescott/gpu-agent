import { z } from "zod"

const CreatorSchema = z.object({
  organization: z.string(),
  people: z.array(z.string()).optional().nullable(),
})

const QuantizationVersionSchema = z.object({
  name: z.string(),
  memoryRequirementGB: z.number(),
  notes: z.string().optional().nullable(),
})

export const MlModelSchema = z.object({
  name: z.string(),
  label: z.string(),
  modelType: z.enum(["llm", "ml"]),
  summary: z.string(),
  useCase: z.string(),
  creator: CreatorSchema,
  modelCardLink: z.string().url().optional().nullable(),
  modelArchitecture: z.string(),
  parameterCount: z.string().optional().nullable(),
  gpuMemoryRequirementGB: z.number().optional().nullable(),
  quantizationVersions: z
    .array(QuantizationVersionSchema)
    .optional()
    .nullable(),
  releaseDate: z.string().optional().nullable(),
  license: z.string().optional().nullable(),
  paperUrl: z.string().url().optional().nullable(),
  trainingData: z.string().optional().nullable(),
  evaluationBenchmarks: z.array(z.string()).optional().nullable(),
  contextLength: z.number().int().optional().nullable(),
  huggingfaceModelId: z.string().optional().nullable(),
  updatedAt: z.string().datetime(),
  references: z.array(z.string().url()),
  notes: z.array(z.string()),
})

export type MlModel = z.infer<typeof MlModelSchema>

export type MlModelType = MlModel["modelType"]

/**
 * Returns the display label for a model type
 */
export function getModelTypeLabel(modelType: MlModelType): string {
  return modelType === "llm" ? "Large Language Model" : "Machine Learning Model"
}
