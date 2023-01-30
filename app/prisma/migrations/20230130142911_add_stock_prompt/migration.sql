-- CreateTable
CREATE TABLE "StockPrompt" (
    "id" SERIAL NOT NULL,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT NOT NULL,

    CONSTRAINT "StockPrompt_pkey" PRIMARY KEY ("id")
);
