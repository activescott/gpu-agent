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
  console.log("Seeded t4: ", t4)
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
