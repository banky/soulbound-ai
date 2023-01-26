/*
  Warnings:

  - A unique constraint covering the columns `[modelId]` on the table `ImageModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ImageModel_modelId_key" ON "ImageModel"("modelId");
