import { MlModel, getModelTypeLabel } from "@/pkgs/isomorphic/model"
import Link from "next/link"
import { Feature } from "./Feature"

import type { JSX } from "react"

interface ModelInfoProps {
  model: MlModel
}

export function ModelInfo({ model }: ModelInfoProps): JSX.Element {
  const typeLabel = getModelTypeLabel(model.modelType)

  return (
    <>
      <h1>
        About the {model.label} Model ({typeLabel})
      </h1>
      <p>{model.summary}</p>

      <h2>Overview</h2>
      <ul>
        <li>
          <strong>Use Case:</strong> {model.useCase}
        </li>
        <li>
          <strong>Creator:</strong> {model.creator.organization}
          {model.creator.people && model.creator.people.length > 0 && (
            <span> ({model.creator.people.join(", ")})</span>
          )}
        </li>
        <li>
          <strong>Architecture:</strong> {model.modelArchitecture}
        </li>
        {model.parameterCount && (
          <li>
            <strong>Parameters:</strong> {model.parameterCount}
          </li>
        )}
        {model.releaseDate && (
          <li>
            <strong>Release Date:</strong> {model.releaseDate}
          </li>
        )}
        {model.license && (
          <li>
            <strong>License:</strong> {model.license}
          </li>
        )}
        {model.contextLength && (
          <li>
            <strong>Context Length:</strong>{" "}
            {model.contextLength.toLocaleString()} tokens
          </li>
        )}
      </ul>

      {(model.gpuMemoryRequirementGB || model.quantizationVersions) && (
        <>
          <h2>GPU Memory Requirements</h2>
          {model.gpuMemoryRequirementGB && (
            <p>
              Default (FP16) inference requires approximately{" "}
              <strong>{model.gpuMemoryRequirementGB} GB</strong> of GPU memory.
            </p>
          )}
          {model.quantizationVersions &&
            model.quantizationVersions.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Quantization</th>
                    <th>Memory (GB)</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {model.quantizationVersions.map((qv) => (
                    <tr key={qv.name}>
                      <td>{qv.name}</td>
                      <td>{qv.memoryRequirementGB}</td>
                      <td>{qv.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </>
      )}

      {model.trainingData && (
        <>
          <h2>Training Data</h2>
          <p>{model.trainingData}</p>
        </>
      )}

      {model.evaluationBenchmarks && model.evaluationBenchmarks.length > 0 && (
        <>
          <h2>Evaluation Benchmarks</h2>
          <ul>
            {model.evaluationBenchmarks.map((benchmark) => (
              <li key={benchmark}>{benchmark}</li>
            ))}
          </ul>
        </>
      )}

      <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
        <Feature
          title="Compare GPUs for AI/ML"
          icon="gpu-card"
          callToAction="View GPU Rankings"
          callToActionLink="/ml/learn/gpu/ranking"
        >
          Compare GPUs by price-per-performance metrics for machine learning
          workloads.
        </Feature>
        {model.huggingfaceModelId && (
          <Feature
            title="Try on Hugging Face"
            icon="box-arrow-up-right"
            callToAction="View Model"
            callToActionLink={`https://huggingface.co/${model.huggingfaceModelId}`}
          >
            Explore the {model.label} model on Hugging Face, including model
            weights and documentation.
          </Feature>
        )}
        {model.paperUrl && (
          <Feature
            title="Read the Paper"
            icon="file-text"
            callToAction="View Paper"
            callToActionLink={model.paperUrl}
          >
            Read the original research paper describing the {model.label}{" "}
            architecture and training methodology.
          </Feature>
        )}
      </div>

      <h2>References</h2>
      <ul>
        {model.references.map((ref) => (
          <li key={ref}>
            <Link href={ref}>{ref}</Link>
          </li>
        ))}
      </ul>

      {model.notes.length > 0 && (
        <>
          <h2>Notes</h2>
          <ul>
            {model.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
