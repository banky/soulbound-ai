/*
  Warnings:

  - You are about to drop the column `orderId` on the `ImageModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ImageModel" DROP COLUMN "orderId",
ADD COLUMN     "modelId" TEXT;
