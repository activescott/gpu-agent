/*
  Warnings:

  - You are about to drop the column `cachedAt` on the `gpu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "gpu" DROP COLUMN "cachedAt";
