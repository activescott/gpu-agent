-- CreateTable
CREATE TABLE "GpuLastCachedListings" (
    "gpuName" TEXT NOT NULL,
    "lastCachedListings" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GpuLastCachedListings_gpuName_key" ON "GpuLastCachedListings"("gpuName");

-- CreateIndex
CREATE INDEX "GpuLastCachedListings_gpuName_idx" ON "GpuLastCachedListings"("gpuName");

-- CreateIndex
CREATE INDEX "Listing_gpuName_idx" ON "Listing"("gpuName");

-- CreateIndex
CREATE INDEX "gpu_name_idx" ON "gpu"("name");
