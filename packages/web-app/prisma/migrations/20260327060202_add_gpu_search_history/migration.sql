-- CreateTable
CREATE TABLE "GpuSearchHistory" (
    "id" TEXT NOT NULL,
    "gpuName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GpuSearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GpuSearchHistory_source_searchedAt_idx" ON "GpuSearchHistory"("source", "searchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GpuSearchHistory_gpuName_source_key" ON "GpuSearchHistory"("gpuName", "source");

-- AddForeignKey
ALTER TABLE "GpuSearchHistory" ADD CONSTRAINT "GpuSearchHistory_gpuName_fkey" FOREIGN KEY ("gpuName") REFERENCES "gpu"("name") ON DELETE CASCADE ON UPDATE CASCADE;
