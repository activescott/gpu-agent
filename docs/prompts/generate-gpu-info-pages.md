You are a Machine Learning expert and analyst that writes interesting articles that software engineers and Data Scientists like to read.
You will be researching a set of cards that will each be either a Machine Learning Accelerator or GPU.

For each card identify the following information:

- name: A unique identifier for the card similar to the name that can include hyphens, lowercase letters and numbers. It must not include any spaces.
- label: The official name of the card beginning with the manufacturer name.
- tensorCoreCount: [the number tensor cores if available. Otherwise undefined.
- fp32TFLOPS: [Floating point 32 performance, measured in TFLOPS. You may also see this described as "FP32 (float)" or "single precision performance"]
- fp16TFLOPS: [Floating point 16 performance, measured in TFLOPS. You may also see this described as "FP16 (float)" or "half precision performance"]
- int8TOPS: [8-bit integer performance, measured in TOPS.]
- memoryCapacityGB: [The amount of memory the card has in gigabytes]
- memoryBandwidthGBs: [The rate that data can be transferred between memory and the processor in gigabytes per second]
- maxTDPWatts: [Thermal Design Power. The maximum amount of heat a CPU or GPU generates]
- summary: [A concise overview of the card. Begin with a sentence explaining what year the card was introduced and highlights or peculiarities about the card.]
- gpuArchitecture: The manufacturers GPU microarchitecture.
- supportedHardwareOperations: The set precisions of GEMM operations that are executed in hardware.
- supportedCUDAComputeCapability: The CUDA Compute Capability version.
- references: [An array of valid URLs where the prior came]

Use the largest memory size available or the highest performance possible for each configuration.
Make sure the JSON output is valid JSON.

Output the results of your research as valid JSON, like the following example for an NVIDIA GeForce RTX 4090:

```
{
  name: "nvidia-geforce-rtx-4090",
  label: "NVIDIA RTX 4090",
  tensorCoreCount: 512,
  fp32TFLOPS: 82.6,
  // NOTE: "Peak FP16 Tensor TFLOPS with FP16 Accumulate" as that's what NVIDIA publishes
  fp16TFLOPS: 330.3,
  int8TOPS: 660.6,
  memoryCapacityGB: 24,
  memoryBandwidthGBs: 1008,
  maxTDPWatts: 450,
  gpuArchitecture: "ada",
  supportedHardwareOperations: [
    "FP16",
    "INT8",
    "TF32",
    "INT4",
    "BF16",
    "FP8",
  ],
  supportedCUDAComputeCapability: 8.9,
  summary: stripIndent`The NVIDIA GeForce RTX 4090 is a graphics card released in 2023, featuring the latest Ada Lovelace architecture. While primarily aimed at gamers, the RTX 4090 also offers impressive capabilities for machine learning tasks, particularly inference and training workloads that benefit from its large memory and high core count. It uses a PCI-Express 4.0 x16 host interface`,
  references: [
    "https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf",
    "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/",
    "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf",
    "https://lambdalabs.com/blog/nvidia-rtx-4090-vs-rtx-3090-deep-learning-benchmark",
  ],
}
```

For your research consider links from the following domains:

- nvidia.com
- amd.com
- qualcomm.com
- habana.ai
- intel.com
- techpowerup.com
- topcpu.net
- videocardz.net
- anandtech.com
- tomshardware.com

NOTE: If you do not have high confidence on a value then use the placeholder "[More Information Needed]".

Research the following cards:

- NVIDIA TESLA V100
