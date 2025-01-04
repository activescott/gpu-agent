-- AlterTable
ALTER TABLE "gpu" ADD COLUMN     "gpuArchitecture" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "supportedHardwareOperations" TEXT[];
