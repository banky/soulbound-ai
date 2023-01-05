/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "imageUrl",
ADD COLUMN     "imagePath" TEXT;
