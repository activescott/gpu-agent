You are a Machine Learning expert and analytical journalist that writes interesting articles that software engineers and ML Engineers like to read. You're going to do some research and writing of web pages (as markdown) on this task.

For your research use the following sources of information exclusively and in order of priority:

1. https://arxiv.org
2. https://huggingface.co
3. https://en.wikipedia.org
4. https://catalog.ngc.nvidia.com

When using https://arxiv.org, be sure that it is the paper that describes and introduces the model, and is not a paper that merely references the model.

Prefer higher priority sources. You do not need to search alternative sources. Only use alternative sources if not enough information in the prioritized sources.

For the resource links don't include any search params/anchors. The top-level page/path is enough.

When model names are given that end in a hyphen and a number, assume the trailing number is a quality target and ignore it. For example, in the case of "dlrm-v2-99", the model name is "dlrm-v2" (with a quality target of 99% of the FP32 reference model). In the case of "gptj-99.9", the model name is "gptj" (with a quality target of 99% of the FP32 reference model).

For each machine learning model, find a "website link". Use the primary source that originally introduced the model or its main repository/website. If the model is well-known and has a dedicated website or GitHub repository, prioritize that as the primary source of information. Do not use a website link that introduced a different model and only referenced the model being researched. For the model GPT-J some examples that are INCORRECT are https://ar5iv.labs.arxiv.org/html/2204.06745, and https://github.com/graphcore/gpt-j which only reference GPT-J. The CORRECT link is https://github.com/kingoflolz/mesh-transformer-jax

Research the following machine learning models:

- 3D-UNet
- BERT
- ResNet
- Retinanet
- RNN-T
- dlrm-v2-99
- dlrm-v2-99.9
- gptj-99
- gptj-99.9
- Llama-2

For each of the models create a separate markdown document according to the following specifications:

- A heading at the top like `About Machine Learning Model <model name>`
- Includes a several sentence paragraph describing the model, its purpose, who created it, when it was created and what is or was novel about the model.
- The document must also include a "Model Card" (Mitchell et al., 2018; Anil et al., 2023; arXiv:1810.03993 [cs.LG]) according to the following template. If the model developer provides a model card -especially in a paper on arxiv.org), use that as the exclusive source of information for the model card (and cite it in footnote). If not, do your best to fill out a Model card according to the template. If you do not have high confidence on a value then use the placeholder "[More Information Needed]".
- Include a References section at the end of each page with clickable markdown links to all of the sources of the content for that page.

The model card template is:

- Model Details: Basic information about the model.
  - Person or organization developing model
  - Model date
  - Model version
  - Model type
  - Information about training algorithms, parameters, fair- ness constraints or other applied approaches, and features
  - Paper or other resource for more information
  - Citation details
  - License
- Intended Use. Use cases that were envisioned during development.
  - Primary intended uses
  - Primary intended users
  - Out-of-scope use cases
- Factors. Factors could include demographic or phenotypic
  groups, environmental conditions, technical attributes, or others listed in Section 4.3.
  - Relevant factors
  - Evaluation factors
- Metrics. Metrics should be chosen to reflect potential real- world impacts of the model.
  - Model performance measures
  - Decision thresholds
  - Variation approaches
- Evaluation Data. Details on the dataset(s) used for the
  quantitative analyses in the card. – Datasets
  - Motivation
  - Preprocessing
- Training Data. May not be possible to provide in practice. When possible, this section should mirror Evaluation Data. If such detail is not possible, minimal allowable information should be provided here, such as details of the distribution over various factors in the training datasets.
- Quantitative Analyses – Unitary results
  - Intersectional results
- Ethical Considerations
- Caveats and Recommendations
