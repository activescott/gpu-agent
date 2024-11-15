import { PrismaClient } from "@prisma/client"
import { stripIndent } from "common-tags"
import _ from "lodash"
const { isNil } = _

const prisma = new PrismaClient()

async function main() {
  const gpus = [
    {
      name: "test-gpu",
      label: "Test GPU",
      tensorCoreCount: 1,
      fp32TFLOPS: 1.1,
      fp16TFLOPS: 1,
      int8TOPS: 1,
      memoryCapacityGB: 1,
      memoryBandwidthGBs: 1,
      gpuArchitecture: "test",
      supportedHardwareOperations: ["INT1"],
    },
    {
      name: "nvidia-t4",
      label: "NVIDIA T4",
      tensorCoreCount: 320,
      fp32TFLOPS: 8.1,
      fp16TFLOPS: 65,
      int8TOPS: 130,
      memoryCapacityGB: 16,
      memoryBandwidthGBs: 320,
      gpuArchitecture: "turing",
      // see "Supported Tensor Core precisions" in table at end of https://www.nvidia.com/en-us/data-center/tensor-cores/
      supportedHardwareOperations: ["FP16", "INT8", "INT4", "INT1"],
      supportedCUDAComputeCapability: 7.5,
      summary:
        "The NVIDIA T4 is a powerful and versatile GPU designed for a variety of applications, including machine learning, data analytics, and virtual desktop infrastructure. Launched in 2018 with part number 0hckjm from Dell and 900-2G183-0000-000 from NVIDIA, it features NVIDIA's Turing architecture, offering a blend of performance and efficiency. With its 16GB GDDR6 memory and advanced Tensor Cores, the T4 is well-suited for both deep learning inference and training tasks. The T4's low power consumption and compact form factor make it an ideal choice for energy-efficient, high-density server environments. A common part number of HCKJM references the Dell version of the card while TCSCT4-KIT references the PNY version of the card.",
      references: [
        "https://www.nvidia.com/en-us/data-center/tesla-t4/",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    {
      name: "nvidia-rtx-a5000",
      label: "NVIDIA RTX A5000",
      tensorCoreCount: 256,
      fp32TFLOPS: 27.77,
      fp16TFLOPS: 27.77,
      /* INT8 TOPS is hard to find for this card. See the forms.developer
      reference below: The INT8 TOPS performance of the RTX A5000 can be
      inferred from its Tensor performance specification. The card's Tensor
      performance is listed as 222.2 TFLOPS (Tera Floating-Point Operations Per
      Second). It's suggested that for INT8 calculations with sparsity, the
      performance should be double this number, meaning the INT8 TOPS
      performance would be approximately 444.4 TOPS​​. 
      */
      int8TOPS: 444.4,
      memoryCapacityGB: 24,
      memoryBandwidthGBs: 768,
      gpuArchitecture: "ampere",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "INT4",
        "INT1",
        "FP64",
        "TF32",
        "BF16",
      ],
      supportedCUDAComputeCapability: 8.6,
      summary:
        "The NVIDIA RTX A5000 GPU is a high-end graphics card designed for demanding applications, including machine learning and advanced rendering. It features NVIDIA's GA102 GPU architecture and offers a substantial 24 GB of GDDR6 memory. The RTX A5000 is known for its balance between performance, power consumption, and memory capabilities, making it a versatile choice for a range of AI and ML workloads.",
      references: [
        "https://www.techpowerup.com/gpu-specs/rtx-a5000.c3748",
        "https://www.nvidia.com/en-us/design-visualization/rtx-a5000/",
        "https://forums.developer.nvidia.com/t/looking-for-full-specs-on-nvidia-a5000/217948",
        "https://www.aspsys.com/nvidia-gpus/",
        "https://www.nvidia.com/content/PDF/nvidia-ampere-ga-102-gpu-architecture-whitepaper-v2.pdf",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    {
      name: "nvidia-a30",
      label: "NVIDIA A30",
      tensorCoreCount: 224,
      // NOTE: This is the Tensor Core FP32 performance, not the CUDA FP32 performance. Noted in the data sheet as "NVIDIA A30 delivers 165 teraFLOPS (TFLOPS) of TF32 deep learning performance."
      fp32TFLOPS: 165,
      // NOTE: This is the Tensor Core FP16 performance, not the CUDA FP16 performance.
      fp16TFLOPS: 165,
      int8TOPS: 330,
      memoryCapacityGB: 24,
      memoryBandwidthGBs: 933.3,
      gpuArchitecture: "ampere",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "INT4",
        "INT1",
        "FP64",
        "TF32",
        "BF16",
      ],
      supportedCUDAComputeCapability: 8.0,
      summary:
        "The NVIDIA A30, launched on April 12th, 2021 with part number 900-21001-0040-100, is a professional-grade accelerator geared towards machine learning and AI computation. Built on the GA100 graphics processor and utilizing a 7 nm process, it excels in handling large-scale AI and machine learning tasks. The A30 is notable for its high memory bandwidth and substantial tensor core count, which significantly boosts the speed of machine learning applications. Its optimized power consumption also makes it a preferred choice for sustainable, high-efficiency data center deployments.",
      references: [
        "https://www.nvidia.com/en-us/data-center/products/a30-gpu/",
        "https://www.techpowerup.com/gpu-specs/a30-pcie.c3792",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    {
      name: "nvidia-a40",
      label: "NVIDIA A40",
      tensorCoreCount: 336,
      fp32TFLOPS: 37.4,
      fp16TFLOPS: 37.4,
      int8TOPS: 299.3,
      memoryCapacityGB: 48,
      memoryBandwidthGBs: 696,
      gpuArchitecture: "ampere",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "INT4",
        "INT1",
        "FP64",
        "TF32",
        "BF16",
      ],
      supportedCUDAComputeCapability: 8.6,
      summary:
        "The NVIDIA A40, launched in October 2020 with part number 900-2G133-0000-100, is a professional-grade GPU built on the GA102 processor. It is tailored for high-end machine learning applications, offering exceptional performance in both AI training and inference tasks. The A40's introduction marks a significant milestone in GPU technology, showcasing advancements in memory capacity, bandwidth, and processing power, suitable for the most demanding AI workloads.",
      references: [
        "https://www.nvidia.com/en-us/data-center/a40/",
        "https://www.techpowerup.com/gpu-specs/a40-pcie.c3700",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    {
      name: "nvidia-a100-pcie",
      label: "NVIDIA A100 PCIe",
      tensorCoreCount: 432,
      // NOTE: This is the Tensor Core FP32 performance, not the CUDA FP32 performance. The A40 for example doesn't have such a spec (only CUDA).
      fp32TFLOPS: 156,
      fp16TFLOPS: 312,
      int8TOPS: 624,
      memoryCapacityGB: 80,
      memoryBandwidthGBs: 1_935,
      gpuArchitecture: "ampere",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "INT4",
        "INT1",
        "FP64",
        "TF32",
        "BF16",
      ],
      supportedCUDAComputeCapability: 8.0,
      summary:
        "The NVIDIA A100 PCIe 80GB was announced in May 2020, is a formidable accelerator in the field of machine learning and artificial intelligence. Built on NVIDIA's advanced Ampere architecture, this accelerator is designed for high-performance computing, deep learning training, and inference tasks. With its massive 80 GB of HBM2e memory and superior memory bandwidth of 1,935 GB/s, it caters to the most demanding AI workloads. The inclusion of 432 tensor cores significantly accelerates machine learning applications, making it a go-to choice for researchers and data scientists. Operating at a base clock of 1065 MHz and a boost clock up to 1410 MHz, it delivers impressive computational power, capped at a maximum power consumption of 300 watts. The A100-PCIE-80GB is notable for its high FP32 performance of 19.5 TFLOPS, emphasizing its capability in handling floating-point operations efficiently.",
      references: [
        "https://www.nvidia.com/en-us/data-center/a100/",
        "https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf",
        "https://developer.nvidia.com/blog/nvidia-ampere-architecture-in-depth/",
        "https://www.techpowerup.com/gpu-specs/a100-pcie-80-gb.c3821",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    /*
    NOTE: dropping the SXM cards as they're not usable by most people and they artificially drive down percentile all rankings of other cards. 
    Only including PCIe cards.
    {
      name: "nvidia-a100-sxm",
      label: "NVIDIA A100 SXM",
      tensorCoreCount: 432,
      // NOTE This is the Tensor Core FP32 performance, not the CUDA FP32 performance. The A40 for example doesn't have such a spec (only CUDA).
      fp32TFLOPS: 156,
      fp16TFLOPS: 312,
      int8TOPS: 624,
      memoryCapacityGB: 80,
      memoryBandwidthGBs: 2_039,
      gpuArchitecture: "ampere",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "INT4",
        "INT1",
        "FP64",
        "TF32",
        "BF16",
      ],
      summary:
        "The NVIDIA A100 SXM4 80GB was announced in May 2020. It is a powerhouse of machine learning and high-performance computing. With its NVIDIA Ampere architecture and 80 GB HBM2e memory, it delivers exceptional performance for AI, data analytics, and HPC applications. Its massive memory bandwidth and the inclusion of tensor cores accelerate machine learning applications, making it ideal for demanding data-intensive tasks. It is unique from the NVIDIA A100 PCIe 80GB using the SXM (Server PCI Express Module) socket solution for connecting NVIDIA compute accelerators that enables it to have higher GPU memory bandwidth than the PCIe version.",
      references: [
        "https://www.nvidia.com/en-us/data-center/a100/",
        "https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf",
        "https://en.wikipedia.org/wiki/SXM_(socket)",
        "https://en.wikipedia.org/wiki/Ampere_(microarchitecture)",
        "https://images.nvidia.com/aem-dam/en-zz/Solutions/data-center/nvidia-ampere-architecture-whitepaper.pdf",
        "https://www.techpowerup.com/gpu-specs/a100-sxm4-80-gb.c3746",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    */
    {
      name: "nvidia-a10",
      label: "NVIDIA A10",
      tensorCoreCount: 288,
      fp32TFLOPS: 31.2,
      // NOTE: FP16 Tensor Core
      fp16TFLOPS: 125,
      // NOTE: INT8 Tensor Core
      int8TOPS: 250,
      memoryCapacityGB: 24,
      memoryBandwidthGBs: 600,
      gpuArchitecture: "ampere",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "INT4",
        "INT1",
        "FP64",
        "TF32",
        "BF16",
      ],
      supportedCUDAComputeCapability: 8.6,
      summary:
        "The NVIDIA A10 (part number 900-2G133-0020-000) is a high-performance GPU designed for professional applications, including machine learning and AI. Launched in April 2021, it features the GA102 graphics processor, offering robust performance for machine learning inference and training. The A10-PCI-24GB stands out for its balance of power efficiency and computing capability, making it a suitable choice for a range of AI-driven tasks. Its architecture allows for efficient handling of AI workloads, and the large memory size caters to demanding applications.",
      references: [
        "https://www.nvidia.com/en-us/data-center/products/a10-gpu/",
        "https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a10/pdf/a10-datasheet.pdf",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    {
      name: "nvidia-h100-pcie",
      label: "NVIDIA H100 PCIe",
      tensorCoreCount: 456,
      // NOTE: FP32 Tensor Core
      fp32TFLOPS: 756,
      // NOTE: FP16 Tensor Core
      fp16TFLOPS: 1_513,
      // NOTE: INT8 Tensor Core
      int8TOPS: 3_026,
      memoryCapacityGB: 80,
      memoryBandwidthGBs: 2039,
      gpuArchitecture: "hopper",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "FP64",
        "TF32",
        "BF16",
        "FP8",
      ],
      supportedCUDAComputeCapability: 9.0,
      summary:
        "The NVIDIA H100 PCIe 80GB is a professional graphics card designed primarily for machine learning and high-performance computing applications. Launched in March 2023, it is built on the innovative Hopper GH100 architecture and utilizes the 4 nm process by TSMC. The H100 PCIe 80GB stands out for its substantial memory capacity and high-speed memory bandwidth, making it exceptionally suitable for handling large datasets and complex machine learning models. Its tensor cores significantly accelerate machine learning operations. The Hopper architecture, as seen in the H100 and H200 GPUs, introduces several technological innovations aimed at enhancing performance in AI training and inference. These GPUs are distinguished by their massive transistor count and advanced memory technologies, like HBM3 and HBM2e, supporting up to 80 GB of memory. The H100 supports HBM2e memory, while the H200 supports the faster HBM3 memory system, which can deliver up to 3 TB/s, a significant increase over the previous generation's capabilities. A common nvidia part number for this card is 900-21010-000-000.",
      references: [
        "https://resources.nvidia.com/en-us-tensor-core/nvidia-tensor-core-gpu-datasheet",
        "https://www.nvidia.com/en-us/data-center/h100/",
        "https://www.techpowerup.com/gpu-specs/h100-pcie-80-gb.c3899",
        "https://en.wikipedia.org/wiki/Hopper_(microarchitecture)",
        "https://www.nvidia.com/en-us/data-center/technologies/hopper-architecture/",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    /*
    NOTE: dropping the SXM cards as they're not usable by most people and they artificially drive down percentile all rankings of other cards. 
    Only including PCIe cards.
    {
      name: "nvidia-h100-sxm",
      label: "NVIDIA H100 SXM",
      tensorCoreCount: 528,
      // NOTE: FP32 Tensor Core
      fp32TFLOPS: 989,
      // NOTE: FP16 Tensor Core
      fp16TFLOPS: 1_979,
      // NOTE: INT8 Tensor Core
      int8TOPS: 3_958,
      memoryCapacityGB: 80,
      memoryBandwidthGBs: 3_350,
      gpuArchitecture: "hopper",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "FP64",
        "TF32",
        "BF16",
        "FP8",
      ],
      summary: stripIndent`The NVIDIA H100 SXM 80GB is a professional graphics card designed primarily for machine learning and high-performance computing applications. Launched in March 2023, it is built on the innovative Hopper GH100 architecture and utilizes the 4 nm process by TSMC. The H100 80GB stands out for its substantial memory capacity and high-speed memory bandwidth, making it exceptionally suitable for handling large datasets and complex machine learning models. Its tensor cores significantly accelerate machine learning operations. The Hopper architecture, as seen in the H100 and H200 GPUs, introduces several technological innovations aimed at enhancing performance in AI training and inference. These GPUs are distinguished by their massive transistor count and advanced memory technologies, like HBM3 and HBM2e, supporting up to 80 GB of memory. The H100 supports HBM2e memory, while the H200 supports the faster HBM3 memory system, which can deliver up to 3 TB/s, a significant increase over the previous generation's capabilities.
      
      The H100 has versions supporting the PCIe or the SXM (Server PCI Express Module) sockets. The SXM socket enables higher GPU memory bandwidth than the PCIe version.
      
      The H100 SXM version has more tensor cores (528 vs 456) and higher performance generally (e.g. 989 FP32 TFLOPs vs 756 FP32 TFLOPs). 
        `,
      references: [
        "https://resources.nvidia.com/en-us-tensor-core/nvidia-tensor-core-gpu-datasheet",
        "https://www.nvidia.com/en-us/data-center/h100/",
        "https://www.techpowerup.com/gpu-specs/h100-pcie-80-gb.c3899",
        "https://en.wikipedia.org/wiki/Hopper_(microarchitecture)",
        "https://www.nvidia.com/en-us/data-center/technologies/hopper-architecture/",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    */
    {
      name: "nvidia-l4",
      label: "NVIDIA L4",
      tensorCoreCount: 240,
      fp32TFLOPS: 120,
      fp16TFLOPS: 242,
      int8TOPS: 485,
      memoryCapacityGB: 24,
      memoryBandwidthGBs: 300,
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
      summary:
        "The NVIDIA L4 GPU was introduced in March 2023 with part number 900-2G193-0000-000. It, along with the L40 are the NVIDIA Ada Lovelace architecture built using the Built on the 5 nm process. The L4 uses the AD104 graphics processor, fourth-generation Tensor Cores, deep learning super sampling (DLSS 3) and 24 GB GDDR6 memory. The L4 is unique in that its maximum power draw is only 72 W which is quite low compared with other Tensor Core GPUs such as the such as the L40 at 300W and L40S at 350W. It is a single-slot PCIe 4.0 x16 card without connectivity for monitors.",
      maxTDPWatts: 72,
      references: [
        "https://www.nvidia.com/en-us/data-center/l4/",
        "https://nvdam.widen.net/s/rvq98gbwsw/l4-datasheet-2595652",
        "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf",
        "https://en.wikipedia.org/wiki/List_of_Nvidia_graphics_processing_units",
        "https://www.techpowerup.com/gpu-specs/l4.c4091",
        "https://www.nvidia.com/en-us/technologies/ada-architecture/",
        "https://developer.nvidia.com/blog/supercharging-ai-video-and-ai-inference-performance-with-nvidia-l4-gpus/",
      ],
    },
    {
      // NOTE: L40S is a newer version of the L40. L40 used 1 AD102 GPU chip.
      name: "nvidia-l40",
      label: "NVIDIA L40",
      tensorCoreCount: 568,
      fp32TFLOPS: 90.5, //the L40 @ 90.5 per https://images.nvidia.com/content/Solutions/data-center/vgpu-L40-datasheet.pdf
      fp16TFLOPS: 181.05, // L40 is 181.05
      int8TOPS: 362, // L40 was 362 according to https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf
      memoryCapacityGB: 48,
      memoryBandwidthGBs: 864,
      maxTDPWatts: 300,
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
      summary: stripIndent`The NVIDIA L40 GPU was introduced in September 2022 with part number 900-2G133-0010-000. It is based on the AD102 chip from the Ada Lovelace architecture. It is optimized for graphics and AI-enabled 2D, video and 3D image generation. It uses the PCIe Gen4 x16 interconnect and Unlike the NVIDIA L4, it allows connecting monitors with 4x DisplayPort connectors.
      `,
      references: [
        "https://images.nvidia.com/content/Solutions/data-center/vgpu-L40-datasheet.pdf",
        "https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf",
        "https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf",
        "https://nvidianews.nvidia.com/news/nvidia-announces-ovx-computing-systems-the-graphics-and-simulation-foundation-for-the-metaverse-powered-by-ada-lovelace-gpu",
      ],
    },
    {
      // NOTE: L40S is a newer version of the L40. L40 used 1 AD102 GPU chip.
      name: "nvidia-l40s",
      label: "NVIDIA L40S",
      tensorCoreCount: 568,
      fp32TFLOPS: 183, // MUCH higher compared to the L40 @ 90.5 per https://images.nvidia.com/content/Solutions/data-center/vgpu-L40-datasheet.pdf
      fp16TFLOPS: 362, // L40 is 181.05
      int8TOPS: 1466, // From https://www.exxactcorp.com/blog/components/NVIDIA-L40S-GPU-Compared-to-A100-and-H100-Tensor-Core-GPU. L40 was 362 according to https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf
      memoryCapacityGB: 48,
      memoryBandwidthGBs: 864,
      maxTDPWatts: 350,
      gpuArchitecture: "ada",
      supportedHardwareOperations: [
        "FP16",
        "INT8",
        "TF32",
        "INT4",
        "BF16",
        "FP8",
      ],
      supportedCUDAComputeCapability: 8.9, // assuming same as L40
      summary: stripIndent`The NVIDIA L40S GPU was introduced in August 2023 (part number 900-2g133-0080-000). It is the successor to the NVIDIA L40 (part number 900-2G133-0010-000) and like the L40 is based on the AD102 chip from the Ada Lovelace architecture. Compared with the L40 it has nearly double the TF32 Tensor Core TFLOPS and FP16 Tensor Core performance, and increases the maximum power draw from 300W to 350W. It is targeted for generative AI and graphics and video applications. It lacks FP64 precision, but has great FP32, FP16 and mixed-precision performance. It uses the PCIe Gen4 x16 interconnect and Unlike the NVIDIA L4, it allows connecting monitors with 4x DisplayPort connectors.
      `,
      references: [
        // PRIMARY:
        "https://www.nvidia.com/en-us/data-center/l40s/",
        "https://www.exxactcorp.com/blog/components/NVIDIA-L40S-GPU-Compared-to-A100-and-H100-Tensor-Core-GPU",
        "https://resources.nvidia.com/en-us-l40s/nvidia-l40s-product",
        "https://nvidianews.nvidia.com/news/nvidia-global-data-center-system-manufacturers-to-supercharge-generative-ai-and-industrial-digitalization",
        // mentions AD102:
        "https://flyytech.com/2023/08/08/nvidia-completes-proviz-ada-lovelace-lineup-with-three-new-graphics-cards/",
        "https://www.nvidia.com/en-us/technologies/ada-architecture/",
      ],
    },
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
    },
    {
      name: "nvidia-tesla-v100-32gb",
      label: "NVIDIA Tesla V100",
      tensorCoreCount: 640,
      fp32TFLOPS: 14,
      fp16TFLOPS: 28,
      int8TOPS: 56, // from https://www.microway.com/knowledge-center-articles/in-depth-comparison-of-nvidia-tesla-volta-gpu-accelerators/
      memoryCapacityGB: 32,
      memoryBandwidthGBs: 900,
      maxTDPWatts: 300,
      gpuArchitecture: "volta",
      // see "Supported Tensor Core precisions" in table at end of https://www.nvidia.com/en-us/data-center/tensor-cores/
      supportedHardwareOperations: ["FP16", "FP64", "FP32", "FP16", "INT8"],
      // lookup GPU Compute Capability at https://developer.nvidia.com/cuda-gpus
      supportedCUDAComputeCapability: 7.0,
      summary:
        "The NVIDIA Tesla V100, introduced with NVIDIA's Volta architecture, is a high-end data center GPU. The 32GB version has part numbers 900-2G500-0202-000,  699-2G500-0202-400, 699-2G500-0202-XXX and ASIN B07JVNHFFX. It's renowned for its AI and high-performance computing capabilities, significantly advancing the field with its impressive tensor core count and large memory capacity. The PNY part number for this card is VCQGV100-PB.",
      references: [
        "https://developer.nvidia.com/blog/inside-volta/",
        "https://www.nvidia.com/en-us/data-center/v100/",
        "https://images.nvidia.com/content/tesla/pdf/Tesla-V100-PCIe-Product-Brief.pdf",
        "https://resources.nvidia.com/en-us-virtualization-and-gpus/v100-datasheet",
        "https://www.tomshardware.com/news/nvidia-tesla-v100-volta-gpu,34379.html",
        "https://www.microway.com/knowledge-center-articles/in-depth-comparison-of-nvidia-tesla-volta-gpu-accelerators/",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    {
      name: "nvidia-tesla-v100-16gb",
      label: "NVIDIA Tesla V100",
      tensorCoreCount: 640,
      fp32TFLOPS: 14,
      fp16TFLOPS: 28,
      int8TOPS: 56, // from https://www.microway.com/knowledge-center-articles/in-depth-comparison-of-nvidia-tesla-volta-gpu-accelerators/
      memoryCapacityGB: 16,
      memoryBandwidthGBs: 900,
      maxTDPWatts: 300,
      gpuArchitecture: "volta",
      // see "Supported Tensor Core precisions" in table at end of https://www.nvidia.com/en-us/data-center/tensor-cores/
      supportedHardwareOperations: ["FP16", "FP64", "FP32", "FP16", "INT8"],
      // lookup GPU Compute Capability at https://developer.nvidia.com/cuda-gpus
      supportedCUDAComputeCapability: 7.0,
      summary:
        "The NVIDIA Tesla V100 16GB version, introduced with NVIDIA's Volta architecture, is a high-end data center GPU. It was the first GPU to feature NVIDIA's Tensor Cores for deep learning and machine learning applications. It's renowned for its AI and high-performance computing capabilities, significantly advancing the field with its impressive tensor core count and large memory capacity. The 16GB version has part number 900-2G500-0000-000 or 699-2G500-0200-XXX. The PNY part number for this card was TCSV100MPCIE-PB and ASIN B076P84525.",
      references: [
        "https://developer.nvidia.com/blog/inside-volta/",
        "https://www.nvidia.com/en-us/data-center/v100/",
        "https://images.nvidia.com/content/tesla/pdf/Tesla-V100-PCIe-Product-Brief.pdf",
        "https://resources.nvidia.com/en-us-virtualization-and-gpus/v100-datasheet",
        "https://www.tomshardware.com/news/nvidia-tesla-v100-volta-gpu,34379.html",
        "https://www.microway.com/knowledge-center-articles/in-depth-comparison-of-nvidia-tesla-volta-gpu-accelerators/",
        "https://www.nvidia.com/en-us/data-center/tensor-cores/",
      ],
    },
    {
      name: "nvidia-tesla-p100",
      label: "NVIDIA Tesla P100",
      // Tesla P100 only has CUDA cores
      tensorCoreCount: undefined, // N/A
      fp32TFLOPS: 10.6,
      fp16TFLOPS: 21.2,
      int8TOPS: undefined, // i can't find it
      memoryCapacityGB: 16,
      memoryBandwidthGBs: 732,
      maxTDPWatts: 300,
      gpuArchitecture: "pascal",
      /* It appears that hardware-accelerated GEMM operations require "Warp matrix functions" supported in Compute Capability >=7.x: https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#compute-capabilities
       */
      supportedHardwareOperations: [
        "FP16",
        "FP32",
        // The 8-bit and 16-bit DP4A and DP2A dot product instructions are supported on GP102-GP106, but not on GP100.
      ],
      supportedCUDAComputeCapability: 6.0,
      summary:
        "The NVIDIA Tesla P100 was announced in 2016 as the first of their Pascal architecture powered Tesla cards. The Tesla P100 came in PCIe and SXM versions and was the first GPU accelerator to use High Bandwidth Memory 2 (HBM2). It did not have Tensor Cores, so it isn't usually preferred for machine learning. However, it's FP32 and FP16 FLOPs are still quite good.",
      references: [
        "https://www.anandtech.com/show/10433/nvidia-announces-pci-express-tesla-p100",
        "https://developer.nvidia.com/blog/mixed-precision-programming-cuda-8/",
        "https://www.anandtech.com/show/10222/nvidia-announces-tesla-p100-accelerator-pascal-power-for-hpc",
      ],
    },
    {
      name: "amd-radeon-rx-580x",
      label: "AMD Radeon RX 580X",
      tensorCoreCount: undefined, // N/A
      fp32TFLOPS: 6.2,
      fp16TFLOPS: 6.2,
      int8TOPS: undefined, //"[More Information Needed]"
      memoryCapacityGB: 8,
      memoryBandwidthGBs: 256.0,
      maxTDPWatts: 185,
      gpuArchitecture: "Graphics Core Next 4",
      supportedHardwareOperations: [],
      supportedCUDAComputeCapability: undefined, // N/A
      summary:
        "The AMD Radeon RX 580X, launched on April 11th, 2018, is built on a 14 nm process and features the Polaris 20 graphics processor. It's a dual-slot card with a maximum power draw of 185 W and supports DirectX 12.",
      references: [
        "https://www.amd.com/en/products/specifications/graphics",
        "https://www.tomshardware.com/reviews/amd-radeon-rx-580-review,5020.html",
        "https://www.techpowerup.com/gpu-specs/radeon-rx-580x.c3190",
        "https://en.wikipedia.org/wiki/Graphics_Core_Next",
      ],
    },
    {
      name: "amd-radeon-rx-590",
      label: "AMD Radeon RX 590",
      // TODO: RDNA3 and CDNA3 (the MI-series) have "AI Accelerator"s which are comparable. Not sure we should be ranking based on cores though. GEMM OPS is all that matters.
      tensorCoreCount: undefined, // N/A
      fp32TFLOPS: 7.1,
      fp16TFLOPS: 7.1,
      int8TOPS: undefined, //"[More Information Needed]"
      memoryCapacityGB: 8,
      memoryBandwidthGBs: 256.0,
      maxTDPWatts: 175,
      gpuArchitecture: "Graphics Core Next 4",
      // "Since the introduction of AMD's CDNA Architecture, Generalized Matrix Multiplication (GEMM) computations are now hardware-accelerated through Matrix Core Processing Units." (presumably GEMM wasn't supported in previous architectures and I can find no reference to them in GCN) – https://gpuopen.com/learn/amd-lab-notes/amd-lab-notes-matrix-cores-README/
      supportedHardwareOperations: [],
      supportedCUDAComputeCapability: undefined, // N/A
      summary:
        "The AMD Radeon RX 590, launched on November 15th, 2018, uses the 12 nm process with the Polaris 30 graphics processor. It's a performance-segment card with a dual-slot form factor and a TDP of 175 W.",
      references: [
        "https://www.amd.com/en/products/specifications/graphics",
        "https://www.tomshardware.com/reviews/amd-radeon-rx-590,5907.html",
        "https://www.techpowerup.com/gpu-specs/radeon-rx-590.c3322",
        "https://en.wikipedia.org/wiki/Graphics_Core_Next",
      ],
    },

    {
      name: "amd-radeon-rx-7900-xtx",
      label: "AMD Radeon RX 7900 XTX",
      // tracking the AI Accelerators as "tensor cores"
      tensorCoreCount: 192,
      fp32TFLOPS: 61,
      fp16TFLOPS: 123,
      int8TOPS: 123,
      memoryCapacityGB: 24,
      memoryBandwidthGBs: 960,
      maxTDPWatts: 355,
      gpuArchitecture: "RDNA 3",
      supportedHardwareOperations: ["FP16", "BF16", "INT8", "INT4"],
      supportedCUDAComputeCapability: undefined, // N/A
      summary: stripIndent`The AMD Radeon RX 7900 XTX, launched on December 13, 2022, is AMD's flagship graphics card on the new RDNA 3 architecture. 
        The RDNA 3 architecture features AI Accelerators and a significant performance boost over its predecessors. The 7900 XTX has 96 compute units (CUs) and 192 AI accelerators. The AI Accelerators accelerate the GEMM operation which are critical to machine learning/AI performance. 
        The 7900 XTX is a compelling GPU for machine learning/AI.
        Some common part numbers are the PowerColor RX7900XTX 24G-E/OC, RX7900XTX 24G-L/OC, Sapphire 11322-02-20G, XFX RX-79XMERCB9, ASRock 90-GA43ZZ-00UANF, and the Asus TUF-RX7900XTX-O24G-GAMING.
        The lowest price is tracked and continuously updated across multiple sellers for all of these models below.`,
      references: [
        "https://www.amd.com/en/products/specifications/graphics",
        "https://www.tomshardware.com/reviews/amd-radeon-rx-7900-xtx-and-xt-review-shooting-for-the-top",
        "https://en.wikipedia.org/wiki/RDNA_3",
        "https://gpuopen.com/learn/wmma_on_rdna3/",
        "https://gpuopen.com/learn/amd-lab-notes/amd-lab-notes-matrix-cores-readme/",
      ],
    },
    {
      name: "amd-radeon-rx-7900-xt",
      label: "AMD Radeon RX 7900 XT",
      // tracking the AI Accelerators as "tensor cores"
      tensorCoreCount: 168,
      fp32TFLOPS: 52,
      fp16TFLOPS: 103,
      int8TOPS: 103,
      memoryCapacityGB: 20,
      memoryBandwidthGBs: 800,
      maxTDPWatts: 315,
      gpuArchitecture: "RDNA 3",
      supportedHardwareOperations: ["FP16", "BF16", "INT8", "INT4"],
      supportedCUDAComputeCapability: undefined, // N/A
      summary: stripIndent`The AMD Radeon RX 7900 XT was released alongside the RX 7900 XTX on December 13, 2022 as one of the GPUs using the new RDNA 3 architecture. 
        It includes RDNA 3 architecture's new AI Accelerators which accelerate the GEMM operations that are critical to machine learning/AI performance. 
        With 84 compute units (CUs) and 168 AI Accelerators, it has 12 fewer (CUs), and 6 fewer AI Accelerators than the 7900 XTX but remains a strong contender in the high-performance GPU market.
        Some common part numbers are the PowerColor RX7900XT 20G-L/OC, Sapphire 11323-02-20G, XFX RX-79TMERCU9.
        The lowest price is tracked and continuously updated across multiple sellers for all of these models below.`,
      references: [
        "https://www.amd.com/en/products/specifications/graphics",
        "https://www.tomshardware.com/reviews/amd-radeon-rx-7900-xtx-and-xt-review-shooting-for-the-top",
        "https://en.wikipedia.org/wiki/RDNA_3",
        "https://gpuopen.com/learn/wmma_on_rdna3/",
        "https://gpuopen.com/learn/amd-lab-notes/amd-lab-notes-matrix-cores-readme/",
      ],
    },
    {
      name: "amd-radeon-rx-7800-xt",
      label: "AMD Radeon RX 7800 XT",
      // tracking the AI Accelerators as "tensor cores"
      tensorCoreCount: 120,
      fp32TFLOPS: 37,
      fp16TFLOPS: 74,
      // NEED REFERENCE
      int8TOPS: undefined,
      memoryCapacityGB: 16,
      memoryBandwidthGBs: 624,
      maxTDPWatts: 263,
      gpuArchitecture: "RDNA 3",
      supportedHardwareOperations: ["FP16", "BF16", "INT8", "INT4"],
      supportedCUDAComputeCapability: undefined, // N/A
      summary: stripIndent`The AMD Radeon RX 7800 XT was unveiled in August, 2023 as one of the GPUs using the new RDNA 3 architecture. It includes RDNA 3 architecture's new AI Accelerators which accelerate the GEMM operations that are critical to machine learning/AI performance. 
      With 60 compute units (CUs) and 120 AI Accelerators, it has lower compute capacity compared to the 7900 XTX's 96 CUs and 192 AI Accelerators, but the RDNA 3 architecture's AI Accelerators make it a contender among AMD GPUs for AI/machine learning.
      Some common models of this card are the PowerColor RX7800XT 16G-E/OC (B0CFPSX77R), the ASRock RX7800XT CL 16GO (B0CHK3929K), Gigabyte GV-R78XTGAMING OC-16GD (B0CGHQ32S2), and Sapphire 11330-03-20G (B0CFWRLDB5). 
      The lowest price for all of these is tracked and continuously updated below.`,
      references: [
        "https://www.amd.com/en/products/specifications/graphics",
        "https://www.amd.com/en/products/graphics/amd-radeon-rx-7800-xt",
        "https://www.amd.com/en/newsroom/press-releases/2024-1-8-amd-unveils-amd-radeon-rx-7600-xt-graphics-card--.html",
        "https://en.wikipedia.org/wiki/RDNA_3",
        "https://gpuopen.com/learn/wmma_on_rdna3/",
        "https://gpuopen.com/learn/amd-lab-notes/amd-lab-notes-matrix-cores-readme/",
        "https://wccftech.com/amd-radeon-rx-7600-xt-16-gb-rnda-3-gpu-2048-cores-16-gb-vram-tackles-rtx-4060-329-us/",
      ],
    },
    {
      name: "amd-radeon-rx-7700-xt",
      label: "AMD Radeon RX 7700 XT",
      // tracking the AI Accelerators as "tensor cores"
      tensorCoreCount: 108,
      fp32TFLOPS: 35,
      fp16TFLOPS: 70,
      // NEED REFERENCE
      int8TOPS: undefined,
      memoryCapacityGB: 12,
      memoryBandwidthGBs: 432,
      maxTDPWatts: 263,
      gpuArchitecture: "RDNA 3",
      supportedHardwareOperations: ["FP16", "BF16", "INT8", "INT4"],
      supportedCUDAComputeCapability: undefined, // N/A
      summary: stripIndent`The AMD Radeon RX 7700 XT was unveiled in August, 2023 as one of the GPUs using the new RDNA 3 architecture. It includes RDNA 3 architecture's new AI Accelerators which accelerate the GEMM operations that are critical to machine learning/AI performance. 
      With 54 compute units (CUs) and 108 AI Accelerators, it has lower compute capacity compared to the 7900 XTX's 96 CUs and 192 AI Accelerators, but the RDNA 3 architecture's AI Accelerators make it a contender among AMD GPUs for AI/machine learning.
      Some common models of this card are the Gigabyte GV-R77XTGAMING OC-12GD, ASRock RX7700XT CL 12GO / 90-GA4QZZ-00UANF, RX7700XT PG 12GO / 90-GA4LZZ-00UANF, RX7700XT SL 12GO / 90-GA4PZZ-00UANF, Asus TUF-RX7700XT-O12G-GAMING/90YV0JK0-M0NA00, PowerColor RX 7700 XT 12G-L/OC / RX7700XT 12GB-L/OC, Sapphire 11335-04-20G and 11335-03-20G, and XFX RX-77TQICKB9.   
      The lowest price is tracked and continuously updated across multiple sellers for all of these models below.`,
      references: [
        "https://www.amd.com/en/products/specifications/graphics",
        "https://www.amd.com/en/products/graphics/amd-radeon-rx-7700-xt",
        "https://en.wikipedia.org/wiki/RDNA_3",
        "https://gpuopen.com/learn/wmma_on_rdna3/",
        "https://gpuopen.com/learn/amd-lab-notes/amd-lab-notes-matrix-cores-readme/",
        "https://wccftech.com/amd-radeon-rx-7600-xt-16-gb-rnda-3-gpu-2048-cores-16-gb-vram-tackles-rtx-4060-329-us/",
      ],
    },
    {
      name: "amd-radeon-rx-7600-xt",
      label: "AMD Radeon RX 7600 XT",
      // tracking the AI Accelerators as "tensor cores"
      tensorCoreCount: 64,
      fp32TFLOPS: 22.57,
      fp16TFLOPS: 45.14,
      // NEED REFERENCE
      int8TOPS: undefined,
      memoryCapacityGB: 16,
      memoryBandwidthGBs: 288,
      maxTDPWatts: 190,
      gpuArchitecture: "RDNA 3",
      supportedHardwareOperations: ["FP16", "BF16", "INT8", "INT4"],
      supportedCUDAComputeCapability: undefined, // N/A
      summary: stripIndent`The AMD Radeon RX 7600 XT was unveiled in January, 2024 as one of the GPUs using the new RDNA 3 architecture. It includes RDNA 3 architecture's new AI Accelerators which accelerate the GEMM operations that are critical to machine learning/AI performance. 
      With 32 compute units (CUs) and 64 AI Accelerators, it has significantly lower compute capacity compared to the 7900 XTX's 96 CUs and 192 AI Accelerators, but the RDNA 3 architecture's AI Accelerators and it's lower price make it a consideration among AMD GPUs for AI/machine learning.
      `,
      references: [
        "https://www.amd.com/en/products/specifications/graphics",
        "https://www.amd.com/en/products/graphics/amd-radeon-rx-7600-xt",
        "https://www.amd.com/en/newsroom/press-releases/2024-1-8-amd-unveils-amd-radeon-rx-7600-xt-graphics-card--.html",
        "https://en.wikipedia.org/wiki/RDNA_3",
        "https://gpuopen.com/learn/wmma_on_rdna3/",
        "https://gpuopen.com/learn/amd-lab-notes/amd-lab-notes-matrix-cores-readme/",
        "https://wccftech.com/amd-radeon-rx-7600-xt-16-gb-rnda-3-gpu-2048-cores-16-gb-vram-tackles-rtx-4060-329-us/",
      ],
    },
  ]

  for (const gpu of gpus) {
    // we don't want to update anything if the values haven't changed because it updates the "updatedAt" timestamp used in the sitemap.
    const where = {
      name: gpu.name,
      label: gpu.label,
      tensorCoreCount: gpu.tensorCoreCount,
      fp32TFLOPS: gpu.fp32TFLOPS,
      fp16TFLOPS: gpu.fp16TFLOPS,
      int8TOPS: gpu.int8TOPS,
      memoryCapacityGB: gpu.memoryCapacityGB,
      memoryBandwidthGBs: gpu.memoryBandwidthGBs,
      maxTDPWatts: gpu.maxTDPWatts,
      gpuArchitecture: gpu.gpuArchitecture,
      // prisma doesn't like it when these nullable list args are undefined, so we have to catch that here:
      references: !isNil(gpu.references)
        ? { equals: gpu.references }
        : { equals: null },
      supportedHardwareOperations: !isNil(gpu.supportedHardwareOperations)
        ? { equals: gpu.supportedHardwareOperations }
        : { equals: null },
      supportedCUDAComputeCapability: gpu.supportedCUDAComputeCapability,
      summary: gpu.summary,
    }
    const gpuCount = await prisma.gpu.count({
      where,
    })
    if (gpuCount > 0) {
      console.log("skipping gpu", gpu.name, "with same values.")
      continue
    }
    console.log("upserting gpu", gpu.name, " with different values...")
    await prisma.gpu.upsert({
      where: { name: gpu.name },
      update: gpu,
      create: gpu,
    })
    console.log("upserting gpu", gpu.name, " complete.")
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
