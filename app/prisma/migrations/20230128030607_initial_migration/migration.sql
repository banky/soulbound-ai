-- CreateEnum
CREATE TYPE "ImageModelState" AS ENUM ('NEEDS_IMAGES', 'NEEDS_TRAINING', 'IS_TRAINING', 'READY');

-- CreateTable
CREATE TABLE "Token" (
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imagePath" TEXT,
    "imageUrl" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("owner")
);

-- CreateTable
CREATE TABLE "ImageModel" (
    "owner" TEXT NOT NULL,
    "state" "ImageModelState" NOT NULL,
    "s3Urls" TEXT[],
    "modelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageModel_pkey" PRIMARY KEY ("owner")
);

-- CreateTable
CREATE TABLE "Order" (
    "orderId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "ready" BOOLEAN NOT NULL,
    "error" BOOLEAN NOT NULL DEFAULT false,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageModel_modelId_key" ON "ImageModel"("modelId");
