-- AlterTable
ALTER TABLE "MetricDefinition" ADD COLUMN     "latestDataAsOf" TIMESTAMP(3),
ADD COLUMN     "profileVersion" TEXT;
