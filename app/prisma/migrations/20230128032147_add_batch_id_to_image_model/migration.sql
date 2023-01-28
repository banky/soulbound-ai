/*
  Warnings:

  - Added the required column `batchId` to the `ImageModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImageModel" ADD COLUMN     "batchId" TEXT NOT NULL;
