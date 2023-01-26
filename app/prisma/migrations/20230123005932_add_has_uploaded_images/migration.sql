/*
  Warnings:

  - You are about to drop the column `hasUploadedImages` on the `Token` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ImageModelState" AS ENUM ('NEEDS_IMAGES', 'IS_TRAINING', 'READY');

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "hasUploadedImages";

-- CreateTable
CREATE TABLE "ImageModel" (
    "owner" TEXT NOT NULL,
    "state" "ImageModelState" NOT NULL,

    CONSTRAINT "ImageModel_pkey" PRIMARY KEY ("owner")
);
