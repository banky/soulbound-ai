-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "imageUrls" TEXT[],

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
