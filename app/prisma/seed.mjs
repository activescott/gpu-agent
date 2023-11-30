import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const t4 = await prisma.gpu.upsert({
    where: { name: "nvidia-t4" },
    update: {},
    create: {
      name: "nvidia-t4",
      label: "NVIDIA T4",
      tensorCoreCount: 320,
      fp32TFLOPS: 8.1,
      fp16TFLOPS: 65,
      int8TOPS: 130,
      memoryCapacityGB: 16,
      memoryBandwidthGBs: 320,
    },
  })
  console.log("Seeded:", t4)
  const testGpu = await prisma.gpu.upsert({
    where: { name: "test-gpu" },
    update: {},
    create: {
      name: "test-gpu",
      label: "Test GPU",
      tensorCoreCount: 1,
      fp32TFLOPS: 1.1,
      fp16TFLOPS: 1,
      int8TOPS: 1,
      memoryCapacityGB: 1,
      memoryBandwidthGBs: 1,
    },
  })
  console.log("Seeded: ", testGpu)
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
