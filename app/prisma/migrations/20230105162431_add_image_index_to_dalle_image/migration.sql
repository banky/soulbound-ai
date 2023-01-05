/*
  Warnings:

  - Added the required column `imageIndex` to the `DalleImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DalleImage" ADD COLUMN     "imageIndex" INTEGER NOT NULL;
