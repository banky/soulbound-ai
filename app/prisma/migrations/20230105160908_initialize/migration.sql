-- CreateTable
CREATE TABLE "DalleImage" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "DalleImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("owner")
);
