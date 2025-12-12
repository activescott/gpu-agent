-- CreateTable
CREATE TABLE "MetricDefinition" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitShortest" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionDollarsPer" TEXT NOT NULL,
    "benchmarkId" TEXT,
    "benchmarkName" TEXT,
    "configuration" TEXT,
    "configurationId" TEXT,
    "gpuField" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricDefinition_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "GpuMetricValue" (
    "id" TEXT NOT NULL,
    "gpuName" TEXT NOT NULL,
    "metricSlug" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GpuMetricValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GpuMetricValue_metricSlug_idx" ON "GpuMetricValue"("metricSlug");

-- CreateIndex
CREATE INDEX "GpuMetricValue_gpuName_idx" ON "GpuMetricValue"("gpuName");

-- CreateIndex
CREATE UNIQUE INDEX "GpuMetricValue_gpuName_metricSlug_key" ON "GpuMetricValue"("gpuName", "metricSlug");

-- AddForeignKey
ALTER TABLE "GpuMetricValue" ADD CONSTRAINT "GpuMetricValue_gpuName_fkey" FOREIGN KEY ("gpuName") REFERENCES "gpu"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GpuMetricValue" ADD CONSTRAINT "GpuMetricValue_metricSlug_fkey" FOREIGN KEY ("metricSlug") REFERENCES "MetricDefinition"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
