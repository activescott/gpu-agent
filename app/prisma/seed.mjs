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
      fp32TFLOPS: 10.32,
      fp16TFLOPS: 10.32,
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
