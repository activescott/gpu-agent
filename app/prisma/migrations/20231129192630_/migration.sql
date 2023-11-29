-- CreateTable
CREATE TABLE "gpu" (
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tensorCoreCount" DOUBLE PRECISION NOT NULL,
    "fp32TFLOPS" DOUBLE PRECISION NOT NULL,
    "fp16TFLOPS" DOUBLE PRECISION NOT NULL,
    "int8TOPS" DOUBLE PRECISION NOT NULL,
    "memoryCapacityGB" DOUBLE PRECISION NOT NULL,
    "memoryBandwidthGBs" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gpu_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "gpu_name_key" ON "gpu"("name");
