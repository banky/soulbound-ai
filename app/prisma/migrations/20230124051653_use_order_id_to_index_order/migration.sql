/*
  Warnings:

  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId");
