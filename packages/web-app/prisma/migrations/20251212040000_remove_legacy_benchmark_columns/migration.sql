-- DropColumn: Remove legacy benchmark columns from gpu table
-- These values are now stored in the GpuMetricValue table

ALTER TABLE "gpu" DROP COLUMN IF EXISTS "counterStrike2Fps3840x2160";
ALTER TABLE "gpu" DROP COLUMN IF EXISTS "counterStrike2Fps2560x1440";
ALTER TABLE "gpu" DROP COLUMN IF EXISTS "counterStrike2Fps1920x1080";
ALTER TABLE "gpu" DROP COLUMN IF EXISTS "3dmarkWildLifeExtremeFps";
