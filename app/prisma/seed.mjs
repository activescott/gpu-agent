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
      references: [
        "https://www.techpowerup.com/gpu-specs/rtx-a5000.c3748",
        "https://www.nvidia.com/en-us/design-visualization/rtx-a5000/",
        "https://forums.developer.nvidia.com/t/looking-for-full-specs-on-nvidia-a5000/217948",
        "https://www.aspsys.com/nvidia-gpus/",
      ],
    },
  ]

  for (const gpu of gpus) {
    await prisma.gpu.upsert({
      where: { name: gpu.name },
      update: {},
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
