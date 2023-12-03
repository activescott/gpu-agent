import { PrismaClient } from "@prisma/client"
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
      summary:
        "The NVIDIA T4 is a powerful and versatile GPU designed for a variety of applications, including machine learning, data analytics, and virtual desktop infrastructure. Launched in 2018, it features NVIDIA's Turing architecture, offering a blend of performance and efficiency. With its 16GB GDDR6 memory and advanced Tensor Cores, the T4 is well-suited for both deep learning inference and training tasks. The T4's low power consumption and compact form factor make it an ideal choice for energy-efficient, high-density server environments.",
      references: ["https://www.nvidia.com/en-us/data-center/tesla-t4/"],
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
      summary:
        "The NVIDIA RTX A5000 GPU is a high-end graphics card designed for demanding applications, including machine learning and advanced rendering. It features NVIDIA's GA102 GPU architecture and offers a substantial 24 GB of GDDR6 memory. The RTX A5000 is known for its balance between performance, power consumption, and memory capabilities, making it a versatile choice for a range of AI and ML workloads.",
      references: [
        "https://www.techpowerup.com/gpu-specs/rtx-a5000.c3748",
        "https://www.nvidia.com/en-us/design-visualization/rtx-a5000/",
        "https://forums.developer.nvidia.com/t/looking-for-full-specs-on-nvidia-a5000/217948",
        "https://www.aspsys.com/nvidia-gpus/",
        "https://www.nvidia.com/content/PDF/nvidia-ampere-ga-102-gpu-architecture-whitepaper-v2.pdf",
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
      summary:
        "The NVIDIA A30, launched on April 12th, 2021, is a professional-grade accelerator geared towards machine learning and AI computation. Built on the GA100 graphics processor and utilizing a 7 nm process, it excels in handling large-scale AI and machine learning tasks. The A30 is notable for its high memory bandwidth and substantial tensor core count, which significantly boosts the speed of machine learning applications. Its optimized power consumption also makes it a preferred choice for sustainable, high-efficiency data center deployments.",
      references: [
        "https://www.nvidia.com/en-us/data-center/products/a30-gpu/",
        "https://www.techpowerup.com/gpu-specs/a30-pcie.c3792",
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
      summary:
        "The NVIDIA A40, launched in October 2020, is a professional-grade GPU built on the GA102 processor. It is tailored for high-end machine learning applications, offering exceptional performance in both AI training and inference tasks. The A40's introduction marks a significant milestone in GPU technology, showcasing advancements in memory capacity, bandwidth, and processing power, suitable for the most demanding AI workloads.",
      references: [
        "https://www.nvidia.com/en-us/data-center/a40/",
        "https://www.techpowerup.com/gpu-specs/a40-pcie.c3700",
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
      summary:
        "The NVIDIA A100 PCIe 80GB was announced in May 2020, is a formidable accelerator in the field of machine learning and artificial intelligence. Built on NVIDIA's advanced Ampere architecture, this accelerator is designed for high-performance computing, deep learning training, and inference tasks. With its massive 80 GB of HBM2e memory and superior memory bandwidth of 1,935 GB/s, it caters to the most demanding AI workloads. The inclusion of 432 tensor cores significantly accelerates machine learning applications, making it a go-to choice for researchers and data scientists. Operating at a base clock of 1065 MHz and a boost clock up to 1410 MHz, it delivers impressive computational power, capped at a maximum power consumption of 300 watts. The A100-PCIE-80GB is notable for its high FP32 performance of 19.5 TFLOPS, emphasizing its capability in handling floating-point operations efficiently.",
      references: [
        "https://www.nvidia.com/en-us/data-center/a100/",
        "https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf",
        "https://developer.nvidia.com/blog/nvidia-ampere-architecture-in-depth/",
        "https://www.techpowerup.com/gpu-specs/a100-pcie-80-gb.c3821",
      ],
    },
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
      summary:
        "The NVIDIA A100 SXM4 80GB was announced in May 2020. It is a powerhouse of machine learning and high-performance computing. With its NVIDIA Ampere architecture and 80 GB HBM2e memory, it delivers exceptional performance for AI, data analytics, and HPC applications. Its massive memory bandwidth and the inclusion of tensor cores accelerate machine learning applications, making it ideal for demanding data-intensive tasks. It is unique from the NVIDIA A100 PCIe 80GB using the SXM (Server PCI Express Module) socket solution for connecting NVIDIA compute accelerators that enables it to have higher GPU memory bandwidth than the PCIe version.",
      references: [
        "https://www.nvidia.com/en-us/data-center/a100/",
        "https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf",
        "https://en.wikipedia.org/wiki/SXM_(socket)",
        "https://en.wikipedia.org/wiki/Ampere_(microarchitecture)",
        "https://images.nvidia.com/aem-dam/en-zz/Solutions/data-center/nvidia-ampere-architecture-whitepaper.pdf",
        "https://www.techpowerup.com/gpu-specs/a100-sxm4-80-gb.c3746",
      ],
    },
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
      summary:
        "The NVIDIA A10-PCI-24GB is a high-performance GPU designed for professional applications, including machine learning and AI. Launched in April 2021, it features the GA102 graphics processor, offering robust performance for machine learning inference and training. The A10-PCI-24GB stands out for its balance of power efficiency and computing capability, making it a suitable choice for a range of AI-driven tasks. Its architecture allows for efficient handling of AI workloads, and the large memory size caters to demanding applications.",
      references: [
        "https://www.nvidia.com/en-us/data-center/products/a10-gpu/",
        "https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a10/pdf/a10-datasheet.pdf",
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
      summary:
        "The NVIDIA H100 PCIe 80GB is a state-of-the-art professional graphics card designed primarily for machine learning and high-performance computing applications. Launched in March 2023, it is built on the innovative Hopper GH100 architecture and utilizes the 4 nm process by TSMC. The H100 PCIe 80GB stands out for its substantial memory capacity and high-speed memory bandwidth, making it exceptionally suitable for handling large datasets and complex machine learning models. Its tensor cores significantly accelerate machine learning operations. The Hopper architecture, as seen in the H100 and H200 GPUs, introduces several technological innovations aimed at enhancing performance in AI training and inference. These GPUs are distinguished by their massive transistor count and advanced memory technologies, like HBM3 and HBM2e, supporting up to 80 GB of memory. The H100 supports HBM2e memory, while the H200 supports the faster HBM3 memory system, which can deliver up to 3 TB/s, a significant increase over the previous generation's capabilities.",
      references: [
        "https://resources.nvidia.com/en-us-tensor-core/nvidia-tensor-core-gpu-datasheet",
        "https://www.nvidia.com/en-us/data-center/h100/",
        "https://www.techpowerup.com/gpu-specs/h100-pcie-80-gb.c3899",
        "https://en.wikipedia.org/wiki/Hopper_(microarchitecture)",
        "https://www.nvidia.com/en-us/data-center/technologies/hopper-architecture/",
      ],
    },
  ]

  for (const gpu of gpus) {
    await prisma.gpu.upsert({
      where: { name: gpu.name },
      update: gpu,
      create: gpu,
    })
    console.log("seeded gpu", gpu)
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
