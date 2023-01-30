/*
  Warnings:

  - Added the required column `class` to the `StockPrompt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StockPromptClass" AS ENUM ('MAN', 'WOMAN', 'OTHER');

-- AlterTable
ALTER TABLE "StockPrompt" ADD COLUMN     "class" "StockPromptClass" NOT NULL;
