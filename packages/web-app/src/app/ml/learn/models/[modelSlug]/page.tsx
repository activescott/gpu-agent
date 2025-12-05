import { ModelInfo } from "@/pkgs/client/components/ModelInfo"
import { getModelTypeLabel } from "@/pkgs/isomorphic/model"
import { getModel, getModelSlugs } from "@/pkgs/server/data/ModelRepository"
import { createDiag } from "@activescott/diag"
import { notFound } from "next/navigation"

const log = createDiag("shopping-agent:learn:modelSlug")

// revalidate the data at most every hour:
export const revalidate = 3600

// Force dynamic rendering to avoid file system dependency during Docker build
export const dynamic = "force-dynamic"

type ModelParams = {
  params: Promise<{ modelSlug: string }>
}

export async function generateMetadata(props: ModelParams) {
  const params = await props.params
  const { modelSlug } = params
  log.debug("generateMetadata for model", modelSlug)

  try {
    const model = await getModel(modelSlug)
    const typeLabel = getModelTypeLabel(model.modelType)
    return {
      title: `About the ${model.label} Model (${typeLabel})`,
      description: model.summary.slice(0, 160),
      alternates: {
        canonical: `https://gpupoet.com/ml/learn/models/${modelSlug}`,
      },
    }
  } catch {
    return {
      title: "Model Not Found",
      description: "The requested model could not be found.",
    }
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await getModelSlugs()
    return slugs.map((modelSlug) => ({ modelSlug }))
  } catch {
    log.warn("Could not generate static params for models")
    return []
  }
}

export default async function Page(props: ModelParams) {
  const params = await props.params
  const { modelSlug } = params

  try {
    const model = await getModel(modelSlug)
    return <ModelInfo model={model} />
  } catch (error) {
    log.error("Failed to load model:", modelSlug, error)
    notFound()
  }
}
