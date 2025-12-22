-- AlterTable
ALTER TABLE "gpu" ALTER COLUMN "notes" DROP DEFAULT;

-- AddColumn: manufacturerIdentifiers
ALTER TABLE "gpu" ADD COLUMN "manufacturerIdentifiers" JSONB;

-- AddColumn: thirdPartyProducts
ALTER TABLE "gpu" ADD COLUMN "thirdPartyProducts" JSONB;
